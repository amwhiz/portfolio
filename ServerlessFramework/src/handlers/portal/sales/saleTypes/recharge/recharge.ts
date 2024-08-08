import { Accounts, Checkout, Customer, Order, ProductsVariant, Sim, SimPlan } from 'src/entities';
import { RechargeBuilder } from '../../interfaces/builders';
import SimService from '@handlers/sim/sim';
import { ProductNameEnum } from 'src/entities/enums/product';
import { dateNow, addDayAndFormat, minusOneDay, checkIsSameDate, scheduleTimeWithThirtyMin } from 'src/helpers/dates';
import { WorkflowBase } from '@handlers/webhook-wati/workflows/pushToQueue';
import { RechargeType } from '@handlers/webhook-wati/workflows/recharge/enums/recharge';
import { KeyType } from '@aw/env';
import { SQSTypes } from 'src/constants/sqs';
import EventScheduler from '@handlers/webhook-wati/workflows/scheduler';
import { RechargePayloadType } from '../../types/recharge';
import { plans, validities, airtime, productPlans } from 'src/constants/productVariants';
import { CheckoutPayload } from '@handlers/checkout';
import { SourceEnum } from 'src/entities/enums/customer';
import { OrderType } from 'src/entities/enums/order';
import { CommissionRequest } from '@handlers/portal/commission/interfaces/commissionRequest';

export class PortalRecharge {
  public async buildPayload(builder: RechargeBuilder, payload: CheckoutPayload & Partial<RechargePayloadType>): Promise<void> {
    await builder.setDefaultProperties(payload);
    await builder.createOrder();
    await builder.createLineItems();
    await builder.upsetSimPlan();
    await builder.rechargeProcess();
  }
}

export class RechargePayload {
  customerId?: Customer;
  checkoutId?: Checkout;
  totalPrice?: number | string = 0;
  airtime?: string;
  validity?: string;
  productVariants?: number[];
  account?: Accounts;
  planStartDate: string;
  simId: Sim;
  simPlanPlan: SimPlan;
  simPlanAirtime: SimPlan;
  simPlanValidity: SimPlan;
  orderId: Order;
}

export class RechargeBuilderService extends WorkflowBase implements RechargeBuilder {
  private simService: SimService;
  private rechargePayload: RechargePayload & RechargePayloadType;
  private scheduleClient: EventScheduler;

  constructor() {
    super();
    this.simService = new SimService();
    this.scheduleClient = new EventScheduler();
  }

  async setDefaultProperties(payload: CheckoutPayload & RechargePayloadType): Promise<void> {
    await this.simService.ormInit();

    const simDocument = await this.simService.getSimByMobileNumber(payload?.mobileNumber);
    this.rechargePayload = {
      planStartDate: payload?.planStartDate,
      simId: simDocument,
      account: payload?.account,
      airtime: payload?.airtime,
      checkoutId: payload?.checkoutId,
      customerId: payload?.customerId,
      totalPrice: payload?.amount,
      validity: payload?.validity,
      productVariants: payload?.checkoutId.productsVariantId,
      orderId: null,
      simPlanAirtime: null,
      simPlanPlan: null,
      simPlanValidity: null,
      email: payload?.email,
      amount: payload?.amount,
      mobileNumber: payload?.mobileNumber,
      plan: payload?.plan,
    };
    await this.updateCheckout();
  }

  async updateCheckout(): Promise<void> {
    await this.simService.updateCheckoutById(this.rechargePayload.checkoutId, {
      simType: this.rechargePayload.simId.simType,
    });
  }

  async createOrder(): Promise<void> {
    const orderPayload = {
      countryFrom: this.rechargePayload.checkoutId.countryFrom,
      countryTravelTo: this.rechargePayload.checkoutId.countryTravelTo,
      customerId: this.rechargePayload.checkoutId.customerId,
      orderDate: dateNow('Date') as Date,
      totalPrice: this.rechargePayload.checkoutId.totalPrice,
      type: this.rechargePayload.checkoutId.type,
      source: SourceEnum.portal,
      flowName: OrderType.Recharge,
      accountId: this.rechargePayload?.account,
    } as Partial<Order>;
    const orderDocument = await this.simService.createOrder(orderPayload);
    this.rechargePayload['orderId'] = orderDocument;

    // Portal Commission
    const commissionPayload: CommissionRequest = {
      simId: this.rechargePayload?.simId,
      orderId: orderDocument,
      accountId: this.rechargePayload?.account,
      checkoutId: this.rechargePayload?.checkoutId,
    };

    await this.queueProcess(SQSTypes.commission, commissionPayload);
  }

  private async getProductVariantById(variantId: number): Promise<ProductsVariant> {
    const variants = await this.simService.getProductVariantsByIds([variantId]);
    return variants?.length ? variants[0] : null;
  }

  async createLineItems(): Promise<void> {
    const products = this.rechargePayload.checkoutId.productsVariantId;
    const totalProducts = products?.length;
    for (let i = 0; i < totalProducts; i++) {
      const productId = products[i];
      const productVariant = await this.getProductVariantById(productId);
      const lineItem = {
        orderId: this.rechargePayload.orderId,
        price: productVariant.price,
        productId: productVariant.productId,
        productVariantId: productVariant,
      };
      await this.simService.createLineItem(lineItem);
    }
  }

  async upsetSimPlan(): Promise<void> {
    const totalProducts = this.rechargePayload.productVariants;
    for (let i = 0; i < totalProducts.length; i++) {
      const productId = this.rechargePayload.productVariants[i];
      const productVariant = await this.getProductVariantById(productId);
      let simPlanDocument = await this.simService.getSimPlan(this.rechargePayload.simId, productVariant.productId, productVariant);
      let convertedDate = this?.rechargePayload?.planStartDate as unknown as Date;

      if (ProductNameEnum.SimValidity === productVariant.productId.name) {
        const latestSimValidity = (await this.simService.getSimPlanBySimId(this.rechargePayload.simId)).find(
          (variants) => variants.productId.name === ProductNameEnum.SimValidity
        );
        convertedDate = latestSimValidity.expiryDate;
      } else if (ProductNameEnum.AirTime === productVariant.productId.name) {
        convertedDate = dateNow('Date') as Date;
      }

      const simPlan = {
        startDate: addDayAndFormat(convertedDate, 0, 'date') as Date,
        expiryDate: addDayAndFormat(convertedDate, productVariant.validityPeriod, 'date') as Date,
        actionDate: minusOneDay(addDayAndFormat(convertedDate, productVariant.validityPeriod, 'date'), 'date') as Date,
        productId: productVariant.productId,
        productVariantId: productVariant,
        isExpired: false,
        simId: this.rechargePayload.simId,
      };

      if (!simPlanDocument) simPlanDocument = await this.simService.crateSimPlan(simPlan);
      else await this.simService.updateSimPlan(simPlanDocument, simPlan);

      if (productPlans.includes(productVariant.productId.name)) {
        this.rechargePayload.simPlanPlan = simPlanDocument;
      } else if (ProductNameEnum.SimValidity === productVariant.productId.name) {
        this.rechargePayload.simPlanValidity = simPlanDocument;
      } else if (ProductNameEnum.AirTime === productVariant.productId.name) {
        this.rechargePayload.simPlanAirtime = simPlanDocument;
      }
    }
  }

  private async createSimActivity(queueResponse: object, productVariantId: ProductsVariant): Promise<void> {
    const simActivity = {
      productVariantId: productVariantId,
      queueId: queueResponse?.['MessageId'],
      simId: this.rechargePayload.simId,
    };

    this.rechargePayload['simActivityId'] = await this.simService.createSimActivity(simActivity);
  }

  async rechargeProcess(): Promise<void> {
    const simDocument = await this.simService.getSimById(this.rechargePayload?.simId?.id);
    const simPlans = await this.simService.getSimPlanBySimId(simDocument);

    const productVariants = (await this.simService.getProductVariantsByIds(this.rechargePayload.checkoutId.productsVariantId)) as ProductsVariant[];
    const rechargePayload = {
      simType: this.rechargePayload?.simId?.simType,
      productsVariantId: productVariants,
      planStartDate: this.rechargePayload.planStartDate,
      checkoutId: this.rechargePayload?.['checkoutId'],
      sim: simDocument,
      date: null,
      airtime: null,
      validity: null,
      amount: 0,
      plan: null,
      rechargeType: null,
      totalPrice: this.rechargePayload.totalPrice,
      simExpireDate: null,
      simId: simDocument,
    };

    for (let i = 0; i < productVariants?.length; i++) {
      const variant = productVariants[i];

      const isPlan = plans.includes(variant.name);
      const isValidity = validities.includes(variant.name);
      const isAirtime = airtime.includes(variant.name);

      if (isPlan) {
        const date = this.rechargePayload.planStartDate;
        rechargePayload['productVariantId'] = variant;
        rechargePayload['plan'] = this.rechargePayload.plan;
        rechargePayload['planStartDate'] = date;
        rechargePayload['date'] = date;
        rechargePayload['simExpireDate'] = simPlans.find((plan) => plan.productId.name === ProductNameEnum.SimValidity).startDate;
        rechargePayload['rechargeType'] = RechargeType.plan;
        rechargePayload['amount'] = variant.price;
        rechargePayload['isValiditySelected'] = isValidity;

        if (checkIsSameDate(this.rechargePayload.planStartDate)) {
          const queue = await this.queueProcess(SQSTypes.recharge, rechargePayload);
          await this.createSimActivity(queue, variant);
        } else {
          await this.scheduleClient.createEvent(rechargePayload, RechargeType.plan, scheduleTimeWithThirtyMin(this.rechargePayload.planStartDate));
        }
      }

      if (isValidity) {
        const simExpireDate = simPlans.find((plan) => plan.productId.name === ProductNameEnum.SimValidity).startDate;
        rechargePayload['productVariantId'] = variant;
        rechargePayload['validity'] = this.rechargePayload.validity;
        rechargePayload['planStartDate'] = simExpireDate as unknown as string;
        rechargePayload['date'] = simExpireDate;
        rechargePayload['simExpireDate'] = simExpireDate;
        rechargePayload['rechargeType'] = RechargeType.validity;
        rechargePayload['amount'] = variant.price;

        const queue = await this.queueProcess(SQSTypes.recharge, rechargePayload); // If customer selected airtime for recharge we push to queue process the recharge.
        await this.createSimActivity(queue, variant);
      }

      if (isAirtime) {
        rechargePayload['productVariantId'] = variant;
        rechargePayload['airtime'] = this.rechargePayload.airtime;
        rechargePayload['planStartDate'] = dateNow('Date') as string;
        rechargePayload['date'] = dateNow('Date') as string;
        rechargePayload['simExpireDate'] = dateNow('Date') as string;
        rechargePayload['rechargeType'] = RechargeType.airtime;
        rechargePayload['amount'] = variant.price;
        rechargePayload['isValiditySelected'] = isValidity;
        const queue = await this.queueProcess(SQSTypes.recharge, rechargePayload); // If customer selected airtime for recharge we push to queue process the recharge.
        await this.createSimActivity(queue, variant);
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
