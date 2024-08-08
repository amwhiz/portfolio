import { OrderSimBuilder, OrderBuilder, OrderSim } from '@handlers/order/order';
import SimService from '@handlers/sim/sim';
import { WorkflowBase } from '@handlers/webhook-wati/workflows/pushToQueue';
import { KeyType } from '@aw/env';
import { SQSTypes } from 'src/constants/sqs';
import { Checkout, ProductsVariant } from 'src/entities';
import { SimTypesEnum } from 'src/entities/enums/common';
import { ProductVariantSkuEnum } from 'src/entities/enums/productVariant';
import { CRMWorkFlow, ParentWorkflow } from 'src/enums/workflows';
import { checkIsSameDate, dateNow, dateType, findAndConvertDate, formatDate, minusOneDay, scheduleTimeWithThirtyMin } from 'src/helpers/dates';
import { CompleteSimBuilder } from '../../interfaces/builders';
import { BuySimType } from '../../types/buySim';
import { DeliveryType } from '../../interfaces/buySim';
import { airtime, plans, validities } from 'src/constants/productVariants';
import { RechargeType } from '@handlers/webhook-wati/workflows/recharge/enums/recharge';
import EventScheduler from '@handlers/webhook-wati/workflows/scheduler';
import { PaymentTypes } from '@handlers/payments/enums/paymentStatus';
import { CommissionRequest } from '@handlers/portal/commission/interfaces/commissionRequest';
import { SourceEnum } from 'src/entities/enums/customer';

export class PortalCompleteSim {
  public async buildPayload<T extends BuySimType>(builder: CompleteSimBuilder, payload: T): Promise<void> {
    await builder.setDefaultProperties(payload);
    await builder.createOrder();
    await builder.instantsActivations();
  }
}

export class CompleteSimBuilderService extends WorkflowBase implements CompleteSimBuilder {
  private simPayload: BuySimType;
  private simService: SimService;
  private scheduleClient: EventScheduler;

  constructor() {
    super();
    this.simService = new SimService();
    this.scheduleClient = new EventScheduler();
  }

  async setDefaultProperties(payload: BuySimType): Promise<void> {
    await this.simService.ormInit();
    this.simPayload = {
      ...payload,
      isCollectionPoint: payload?.deliveryType === DeliveryType['Free Collection Points'],
      isDoorDelivery: payload?.deliveryType === DeliveryType['Door Delivery - R99'],
    };
    this.simPayload['selectedPlan'] = await this.simService.getProductVariantBySku(payload?.plan as ProductVariantSkuEnum);
    await this.updateCheckout();
  }

  async updateCheckout(): Promise<void> {
    const checkout = await this.simService.getCheckoutById((this.simPayload.checkoutId as Checkout).id);
    const updateCheckout: Partial<Checkout> = {
      paidAt: <Date>dateNow('Date'),
      completedAt: <Date>dateNow('Date'),
      isCompleted: true,
      isPaid: true,
    };

    this.simPayload['checkoutId'] = await this.simService.updateCheckoutById(checkout, updateCheckout);
  }

  async createOrder(): Promise<void> {
    const orderBuilder = new OrderSimBuilder();
    this.simPayload.sources = SourceEnum.portal;
    const order = await orderBuilder.buildPayload(new OrderBuilder(), this.simPayload as OrderSim);
    this.simPayload.simId = order.simId;
    this.simPayload.simPlanPlan = order.simPlanPlan;
    this.simPayload.simPlanAirtime = order.simPlanAirtime;
    this.simPayload.simPlanValidity = order.simPlanValidity;

    const crmPayload = {
      checkoutId: this.simPayload.checkoutId.id as unknown as Checkout,
      flowName: CRMWorkFlow.Payment,
      paymentStatus: PaymentTypes?.completed,
      isDoorDelivery: this.simPayload.checkoutId?.isDoorDelivery,
    };

    // Portal Commission
    const commissionPayload: CommissionRequest = {
      simId: order?.simId,
      orderId: order?.orderId,
      accountId: this.simPayload?.account,
      checkoutId: this.simPayload?.checkoutId,
    };

    await this.queueProcess(SQSTypes.commission, commissionPayload);

    await this.queueProcess(SQSTypes.crm, crmPayload);
    await this.instantsActivations();
  }

  async createSimActivity(queueResponse: object, productVariantId: ProductsVariant): Promise<void> {
    const simActivity = {
      productVariantId: productVariantId,
      queueId: queueResponse?.['MessageId'],
      simId: this.simPayload.simId,
    };

    this.simPayload['simActivityId'] = await this.simService.createSimActivity(simActivity);
  }

  private checkIsPlanStartDateToday(planStartDate: string): string {
    const isSameDate = checkIsSameDate(planStartDate); // If same as today date. Only add 30 minutes.
    const scheduleDateAndTime = isSameDate ? dateNow('Date') : minusOneDay(findAndConvertDate(planStartDate), 'date');
    return scheduleTimeWithThirtyMin(scheduleDateAndTime);
  }

  async instantsActivations(): Promise<void> {
    const productVariants = await this.simService.getProductVariantsByIds(this.simPayload?.checkoutId?.productsVariantId);

    // * * If the SIM type is eSIM and the pick-up option is selected, instant activations are not necessary.
    const activationPayload = {
      simType: this.simPayload.checkoutId.simType === SimTypesEnum.pSIM ? SimTypesEnum.pSIM : SimTypesEnum.eSIM,
      serialNumber: this.simPayload?.serialNumber,
      email: this.simPayload.email,
      whatsappNumber: this.simPayload.whatsappNumber,
      planStartDate: formatDate(dateType(this.simPayload.planStartDate)),
      checkoutId: this.simPayload?.checkoutId,
      parentFlowName: ParentWorkflow.Activation,
      simId: this.simPayload.simId,
      simPlanPlan: this.simPayload.simPlanPlan,
      simPlanAirtime: this.simPayload.simPlanAirtime,
      simPlanValidity: this.simPayload.simPlanValidity,
      plan: this.simPayload?.plan,
      device: this.simPayload.device,
    };

    for (let productVariantIndex = 0; productVariantIndex < productVariants?.length; productVariantIndex++) {
      const variant = productVariants[productVariantIndex];

      const isPlan = plans.includes(variant.name);
      const isValidity = validities.includes(variant.name);
      const isAirtime = airtime.includes(variant.name);

      if (isPlan) {
        const queue = await this.queueProcess(SQSTypes.workflow, activationPayload);
        await this.createSimActivity(queue, variant);
      }

      if (isValidity) {
        activationPayload['validity'] = this.simPayload.validity;
        activationPayload['date'] = formatDate(dateType(this.simPayload.planStartDate));
        activationPayload['simExpireDate'] = this.simPayload.planStartDate;
        activationPayload['rechargeType'] = RechargeType.validity;
        activationPayload['amount'] = variant.price;
        activationPayload['productVariantId'] = variant;
        const scheduleDate = this.checkIsPlanStartDateToday(activationPayload.planStartDate);
        await this.scheduleClient.createEvent(activationPayload, RechargeType.validity, scheduleDate);
      }

      if (isAirtime) {
        activationPayload['airtime'] = this.simPayload.airtime;
        activationPayload['date'] = formatDate(dateType(this.simPayload.planStartDate));
        activationPayload['simExpireDate'] = this.simPayload.planStartDate;
        activationPayload['rechargeType'] = RechargeType.airtime;
        activationPayload['amount'] = variant.price;
        activationPayload['productVariantId'] = variant;
        const scheduleDate = this.checkIsPlanStartDateToday(activationPayload.planStartDate);
        await this.scheduleClient.createEvent(activationPayload, RechargeType.validity, scheduleDate);
      }
    }
    await this.simService.closeConnection();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async queueProcess(queueType: KeyType, payload: object = {}): Promise<any> {
    const response = await super.pushToQueue(queueType, payload);
    await super.delay(2000);
    return response;
  }
}
