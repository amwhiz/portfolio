/* eslint-disable @typescript-eslint/no-explicit-any */
import { IActivationBuilder } from './interfaces/activationBuilder';
import { Checkout, Customer, ProductsVariant, Sim, SimActivity, SimPlan } from 'src/entities';
import { WorkflowBase } from '../pushToQueue';
import { AppError } from '@libs/api-error';
import { KeyType } from '@aw/env';
import { SimType, SimTypesEnum } from 'src/entities/enums/common';
import { ActivationExecutiveRequest } from './interfaces/activation';
import { SQSTypes } from 'src/constants/sqs';
import { Templates } from 'src/constants/templates';
import { ProductVariantSkuEnum } from 'src/entities/enums/productVariant';
import SimService from '@handlers/sim/sim';
import ValidatorBase from '@handlers/validator/validator';

export class ActivationSim {
  public async buildPayload<T>(builder: IActivationBuilder, payload: T): Promise<void> {
    await builder.setDefaultProperties(payload);
    await builder.checkoutCustomerPaid();
    await builder.activateExecutiveSim();
  }
}

export class ActivationPayload {
  email?: string;
  checkoutId?: Checkout = null;
  products?: number[];
  totalPrice?: number = 0;
  serialNumber?: string; // Need for 'already have a sim' flow
  simId?: Sim;
  simSerial?: string;
  simPlan?: SimPlan;
  simActivityId?: SimActivity;
  customerId?: Customer;
  simType?: SimType;
  device?: string;
  whatsappNumber?: string;
  planStartDate?: string | Date;
  plan?: string;
  simPlanPlan?: SimPlan;
  simPlanAirtime?: SimPlan;
  simPlanValidity?: SimPlan;
  selectedOption?: string | 'yes';
  productVariant?: ProductsVariant;
  flowName?: string;
}

export class ActivationBuilder extends WorkflowBase implements IActivationBuilder {
  private activation: ActivationPayload = {};
  private simService: SimService;

  constructor() {
    super();
    this.simService = new SimService();
  }

  private async getPlan(selectedOption: string, email: string): Promise<SimPlan> {
    const validator = new ValidatorBase(null);
    await validator.ormInit();
    const customer = await validator.getCustomerByEmail(email);
    const plans = await validator.getSimPlanByCustomer(customer);
    return plans[+selectedOption - 1];
  }

  async setDefaultProperties(payload: ActivationPayload): Promise<void> {
    await this.simService.ormInit();

    let selectedPlan: SimPlan;
    if (payload?.selectedOption) {
      payload['selectedOption'] = `${payload?.selectedOption}`.toLowerCase() === 'yes' ? '1' : payload?.selectedOption;
      // Direct Activation
      selectedPlan = await this.getPlan(payload?.selectedOption, payload?.email);
    }

    this.activation = {
      simType: (payload?.simType || selectedPlan?.simId?.simType) === SimTypesEnum.eSIM ? SimType.eSIM : SimType.pSIM,
      serialNumber: payload?.serialNumber || selectedPlan?.simId?.serialNumber,
      products: payload?.checkoutId?.productsVariantId,
      checkoutId: payload?.checkoutId,
      customerId: payload?.checkoutId?.customerId,
      email: payload?.email,
      whatsappNumber: payload?.whatsappNumber,
      planStartDate: payload?.planStartDate || selectedPlan?.startDate,
      simPlanPlan: payload?.simPlanPlan || selectedPlan,
      simPlanAirtime: payload?.simPlanAirtime,
      simPlanValidity: payload?.simPlanValidity,
      simId: payload?.simId ?? selectedPlan?.simId,
      plan: payload?.plan || selectedPlan?.productVariantId.sku,
      device: payload?.device,
      flowName: payload?.flowName,
    };
  }

  async checkoutCustomerPaid(): Promise<void> {
    if (!this.activation.checkoutId?.isPaid && this.activation.flowName !== 'Existingsim_activation') {
      await this.queueProcess(SQSTypes.notification, null, Templates.customerNotPaid);
      throw new AppError('Customer not paid', 400);
    }
  }

  async createSimActivity(queueResponse: object): Promise<void> {
    const productVariant = await this.simService.getProductVariantBySku(this.activation.plan as ProductVariantSkuEnum);

    const simActivity = {
      productVariantId: productVariant,
      queueId: queueResponse?.['MessageId'],
      simId: this.activation.simId,
    };
    this.activation.simActivityId = await this.simService.createSimActivity(simActivity);
  }

  private buildActivationExecutive(): ActivationExecutiveRequest {
    return {
      serialNumber: this.activation.serialNumber,
      simType: this.activation.simType,
      email: this.activation.email,
      whatsappNumber: this.activation.whatsappNumber,
      planStartDate: this.activation.planStartDate as string,
      simPlanPlan: this.activation.simPlanPlan,
      plan: this.activation.plan,
      device: this.activation.device,
      checkoutId: this.activation?.checkoutId,
    };
  }

  async activateExecutiveSim(): Promise<void> {
    const activationPayload = this.buildActivationExecutive();
    const queueResponse = await this.queueProcess(SQSTypes.activation, activationPayload);

    await this.createSimActivity(queueResponse);
    await this.simService.closeConnection();
  }

  private async queueProcess(queueName: KeyType, notificationData: any = {}, templateName?: string): Promise<any> {
    const queue = await super.pushToQueue(queueName, {
      templateName,
      ...notificationData,
    });

    // Delay the execution 3 seconds, Otherwise notification receiving order might be changed.
    super.delay(3000);
    return queue;
  }
}
