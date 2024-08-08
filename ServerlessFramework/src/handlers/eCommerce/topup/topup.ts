import CdsClient from '@aw/cds';
import { Accounts, Checkout, Customer, Order, ProductsVariant, SimPlan, Sim } from 'src/entities';
import { RechargeExecutiveRequest } from '../interfaces/recharge';
import { ProductVariantNameEnum, ProductVariantSkuEnum } from 'src/entities/enums/productVariant';
import { addDayAndFormat, dateNow, dateType, formatDateActivation, hubspotFormatDate, isSimPasteDate, minusOneDay } from 'src/helpers/dates';
import { RechargeType } from '../enums/rechargeType';
import { ExtendSimRequestType } from '@aw/cds/types/extendSim';
import { PassWordCredentialsType } from '@aw/cds/types/auth';
import SimService from '@handlers/sim/sim';
import { LoggerService } from '@aw/logger';
import { KeyType } from '@aw/env';
import { CRMWorkFlow } from 'src/enums/workflows';
import { SQSTypes } from 'src/constants/sqs';
import { convertNormalDate } from 'src/helpers/convertDate';
import { ProductNameEnum } from 'src/entities/enums/product';
import { WorkflowBase } from '@handlers/webhook-wati/workflows/pushToQueue';
import { Regions } from 'packages/aw-cds/enums/region';
import { plans, validities, airtime, productPlans } from 'src/constants/productVariants';
import { CheckoutPayload } from '@handlers/checkout';
import { SourceEnum } from 'src/entities/enums/customer';
import { OrderType } from 'src/entities/enums/order';
import { RechargeBuilder } from '../interfaces/builder';
import { RechargePayloadType } from '../types/recharge';
import { SimType } from 'src/entities/enums/common';
import { EcommerceProductsVariant } from 'src/entities/eCommerceProductVariant';

export class RechargeExecutivePayload {
  orderId?: Order;
  expiryDate?: string | Date;
  startDate?: string | Date;
  actionDate?: string | Date;
  selectedProductVariant?: EcommerceProductsVariant;
  simPlan?: SimPlan;
  addSimValidityPeriodByAirTime?: number;
  addSimValidityDateByAirTime?: Date;
  isActive?: boolean;
  simPlanValidity?: SimPlan;
  simPlanAirtime?: SimPlan;
  isPlanSelected?: boolean;
}

export default class ShopifyRechargeExecutive extends WorkflowBase {
  private cdsServices: CdsClient;
  private rechargeExecutive: RechargeExecutiveRequest & RechargeExecutivePayload;
  private simService: SimService;
  private logger = new LoggerService({ serviceName: ShopifyRechargeExecutive.name });

  constructor() {
    super();
    this.cdsServices = new CdsClient();
    this.simService = new SimService();
  }

  async setDefaultProperties(payload: RechargeExecutiveRequest): Promise<void> {
    const sim = await this.simService.getSimById(payload?.simId ?? payload?.sim?.id);

    let variants: ProductsVariant[];
    if (payload?.checkoutId?.productsVariantId) variants = await this.simService.getVariantsByIds(payload?.checkoutId?.productsVariantId);

    this.rechargeExecutive = {
      sim: sim,
      serialNumber: sim?.serialNumber,
      checkoutId: payload?.checkoutId,
      email: sim?.customerId?.email,
      whatsappNumber: sim?.customerId?.whatsapp,
      date: payload?.date,
      airtime: payload?.airtime as ProductVariantSkuEnum,
      validity: payload.validity as ProductVariantSkuEnum,
      amount: payload?.amount,
      mobileNumber: sim?.mobileNo,
      plan: payload?.plan,
      rechargeType: payload?.rechargeType,
      totalPrice: payload?.totalPrice,
      simExpireDate: payload?.simExpireDate,
      isValiditySelected: payload?.isValiditySelected,
      simPlanValidity: payload?.simPlanValidity,
      isPlanSelected: !!variants?.find((variant) => variant?.productId?.name === ProductNameEnum.UnlimitedPlans)?.id,
    };
    this.rechargeExecutive['selectedProductVariant'] = await this.getProductVariant();
  }

  async getProductVariant(): Promise<EcommerceProductsVariant> {
    let variant: ProductVariantSkuEnum;

    if (this.rechargeExecutive.rechargeType === RechargeType.airtime) {
      variant = this.rechargeExecutive.airtime;
    } else if (this.rechargeExecutive.rechargeType === RechargeType.plan) {
      variant = this.rechargeExecutive.plan;
    }

    const productVariant = await this.simService.getVariantBySku(variant, this.rechargeExecutive.sim?.countryFrom);
    return productVariant;
  }

  async updateSimPlan(): Promise<void> {
    const simPlans = await this.simService.getSimPlanByVariant(
      this.rechargeExecutive.sim,
      this.rechargeExecutive.selectedProductVariant.productId,
      this.rechargeExecutive.selectedProductVariant
    );

    this.rechargeExecutive['simPlan'] = simPlans;

    await this.simService.updateSimPlan(simPlans, {
      expiryDate: this.rechargeExecutive.expiryDate as Date,
      actionDate: this.rechargeExecutive.actionDate as Date,
      startDate: this.rechargeExecutive.startDate as Date,
      isActive: this.rechargeExecutive.isActive,
    });
  }

  // Extend sims validity
  async extendSim(credentials: PassWordCredentialsType, date: string): Promise<void> {
    const extendSim: ExtendSimRequestType = {
      Pass: credentials.Password,
      Action: 'Modify',
      MobileNo: this.rechargeExecutive.mobileNumber,
      PlanExpiryDt: date,
      UsrID: credentials.UserID,
    };
    await this.cdsServices.validitySim(null, extendSim, this.rechargeExecutive.email);
  }

  async canAddSimValidity(credentials: PassWordCredentialsType): Promise<void> {
    const simExpireDateIsBeforeAirtime = isSimPasteDate(this.rechargeExecutive.simExpireDate);
    this.rechargeExecutive.addSimValidityPeriodByAirTime = 30;
    if (!simExpireDateIsBeforeAirtime) {
      this.rechargeExecutive.addSimValidityDateByAirTime = dateNow('Date') as Date;
      await this.doSimValidity(credentials);
    }
  }

  async doAirTime(credentials: PassWordCredentialsType): Promise<void> {
    const airtimePayload = {
      ...credentials,
      MobileNo: this.rechargeExecutive.mobileNumber,
      RechargeAmt: `${this.rechargeExecutive.amount}`,
      PlanName: '',
      PlanCode: this.rechargeExecutive.selectedProductVariant.planCode,
    };

    await this.cdsServices.rechargeSim(null, airtimePayload, this.rechargeExecutive.email);
    const airtimeDate = addDayAndFormat(this.rechargeExecutive.date, 30, 'date') as string;
    await this.extendSim(credentials, airtimeDate);

    this.rechargeExecutive['actionDate'] = minusOneDay(airtimeDate, 'date');
    this.rechargeExecutive['startDate'] = convertNormalDate(this.rechargeExecutive.date);
    this.rechargeExecutive['expiryDate'] = new Date(airtimeDate);
    this.rechargeExecutive['isActive'] = true;

    if (!this.rechargeExecutive.isValiditySelected) await this.canAddSimValidity(credentials);
    await this.updateSimPlan();
  }

  async doSimValidity(credentials: PassWordCredentialsType): Promise<void> {
    const fromSimValidity = this.rechargeExecutive.selectedProductVariant?.validityPeriod + (this.rechargeExecutive?.isPlanSelected ? 30 : 0);
    const addValidityPeriod: number = this.rechargeExecutive.addSimValidityPeriodByAirTime || fromSimValidity;
    const addValidityDate = this.rechargeExecutive.addSimValidityDateByAirTime || this.rechargeExecutive.simExpireDate;
    const date = addDayAndFormat(addValidityDate, addValidityPeriod, 'date');
    await this.extendSim(credentials, formatDateActivation(dateType(date)));

    this.rechargeExecutive['actionDate'] = minusOneDay(date, 'date');
    this.rechargeExecutive['startDate'] = convertNormalDate(this.rechargeExecutive.date);
    this.rechargeExecutive['expiryDate'] = date as string;
    this.rechargeExecutive['isActive'] = true;
    await this.updateSimPlan();
  }

  async getActiveValidity(): Promise<SimPlan> {
    const simPlans = await this.simService.getSimPlanBySimId(this.rechargeExecutive.sim);
    return simPlans.find((variant) => variant.ecommerceVariantId?.name === ProductVariantNameEnum.SimValidity);
  }

  async doPlan(credentials: PassWordCredentialsType): Promise<void> {
    const _planDate = addDayAndFormat(this.rechargeExecutive.date, this.rechargeExecutive.selectedProductVariant.validityPeriod, 'date');
    const planPayload = {
      ...credentials,
      RechargeAmt: `${this.rechargeExecutive.amount}`,
      PlanCode: this.rechargeExecutive.selectedProductVariant.planCode,
      MobileNo: this.rechargeExecutive.mobileNumber,
    };
    await this.cdsServices.rechargeSim(null, planPayload, this.rechargeExecutive.email);
    this.rechargeExecutive['actionDate'] = minusOneDay(_planDate, 'date');
    this.rechargeExecutive['startDate'] = convertNormalDate(this.rechargeExecutive.date);
    this.rechargeExecutive['expiryDate'] = _planDate as string;
    this.rechargeExecutive['isActive'] = true;

    await this.updateSimPlan();
    this.rechargeExecutive['selectedProductVariant'] = await this.simService.getVariantBySku(
      ProductVariantSkuEnum['30Days-Free'],
      this.rechargeExecutive?.sim?.countryFrom
    );

    if (!this.rechargeExecutive?.isValiditySelected) {
      this.rechargeExecutive.simPlanValidity = await this.getActiveValidity();
      this.rechargeExecutive['selectedProductVariant'] = this.rechargeExecutive.simPlanValidity?.ecommerceVariantId;
      this.rechargeExecutive.addSimValidityPeriodByAirTime = 30;
      this.rechargeExecutive.simExpireDate = hubspotFormatDate(this.rechargeExecutive.simPlanValidity.expiryDate);
      await this.doSimValidity(credentials);
    }
  }

  async doRecharge(payload: RechargeExecutiveRequest): Promise<void> {
    await this.simService.ormInit();
    await this.setDefaultProperties(payload);
    const credentials = await this.cdsServices.getGlobalCredentials(this.rechargeExecutive.sim?.countryFrom as Regions);

    switch (payload?.rechargeType) {
      case RechargeType.airtime:
        await this.doAirTime(credentials);
        break;
      case RechargeType.plan:
        await this.doPlan(credentials);
        break;
      default:
        this.logger.error('Nothing to handle');
    }

    await this.queueProcess(SQSTypes.crm, {
      checkoutId: this.rechargeExecutive.checkoutId.id,
      flowName: CRMWorkFlow.Recharge,
      simId: this.rechargeExecutive.sim.id,
    });

    await this.simService.closeConnection();
  }

  private async queueProcess(queueName: KeyType, notificationData: object = {}, templateName?: string): Promise<void> {
    await super.pushToQueue(queueName, {
      templateName,
      ...notificationData,
    });

    // Delay the execution 3 seconds, Otherwise notification receiving order might be changed.
    super.delay(3000);
  }
}

export class ShopifyRecharge {
  public async buildPayload(builder: RechargeBuilder, payload: CheckoutPayload & Partial<RechargePayloadType>): Promise<void> {
    await builder.setDefaultProperties(payload);
    await builder.createOrder();
    await builder.createLineItems();
    await builder.upsetSimPlan();
    await builder.rechargeProcess();
    await builder.updateCustomerReferral();
  }
}

export class RechargePayload {
  customerId?: Customer;
  checkoutId?: Checkout;
  totalPrice?: number | string = 0;
  airtime?: string;
  validity?: string;
  plan?: string;
  productVariants?: number[];
  account?: Accounts;
  planStartDate?: string;
  simId?: number;
  sim?: Sim;
  simPlanPlan: SimPlan;
  simPlanAirtime: SimPlan;
  simPlanValidity: SimPlan;
  orderId?: Order;
  customerReferralId?: number;
  type?: OrderType;
}

export class RechargeBuilderService extends WorkflowBase implements RechargeBuilder {
  private simService: SimService;
  private rechargePayload: RechargePayload & RechargePayloadType;

  constructor() {
    super();
    this.simService = new SimService();
  }

  async setDefaultProperties(payload: CheckoutPayload & RechargePayloadType): Promise<void> {
    await this.simService.ormInit();

    const simDocument = await this.simService.getSimById(payload?.simId);
    this.rechargePayload = {
      planStartDate: hubspotFormatDate(new Date()),
      simId: simDocument?.id,
      airtime: payload?.airtime,
      checkoutId: payload?.checkoutId,
      customerId: simDocument?.customerId,
      totalPrice: payload?.amount ?? 0,
      validity: payload?.validity,
      productVariants: payload?.checkoutId.productsVariantId,
      orderId: null,
      simPlanAirtime: null,
      simPlanPlan: null,
      simPlanValidity: null,
      email: payload?.email,
      amount: payload?.amount,
      mobileNumber: simDocument?.mobileNo,
      plan: payload?.plan,
      customerReferralId: payload?.customerReferralId,
      sim: simDocument,
    };
  }

  async createOrder(): Promise<void> {
    const orderPayload = {
      countryFrom: this.rechargePayload.checkoutId.countryFrom,
      countryTravelTo: this.rechargePayload.checkoutId.countryTravelTo,
      customerId: this.rechargePayload.checkoutId.customerId,
      orderDate: dateNow('Date') as Date,
      totalPrice: this.rechargePayload.checkoutId.totalPrice,
      type: this.rechargePayload.checkoutId.type,
      source: SourceEnum.Shopify,
      flowName: OrderType.Recharge,
      accountId: this.rechargePayload?.account,
    } as Partial<Order>;
    const orderDocument = await this.simService.createOrder(orderPayload);
    this.rechargePayload['orderId'] = orderDocument;
  }

  private async getProductVariantById(variantId: number): Promise<EcommerceProductsVariant> {
    const variants = await this.simService.getVariantsByIds([variantId]);
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
        ecommerceProductVariantId: productVariant,
      };
      await this.simService.createLineItem(lineItem);
    }
  }

  async upsetSimPlan(): Promise<void> {
    const totalProducts = this.rechargePayload.productVariants;
    for (let i = 0; i < totalProducts.length; i++) {
      const productId = this.rechargePayload.productVariants[i];
      const productVariant = await this.getProductVariantById(productId);
      let simPlanDocument = await this.simService.getSimPlanByVariant(this.rechargePayload.sim, productVariant.productId, productVariant);
      let convertedDate = this?.rechargePayload?.planStartDate as unknown as Date;

      if (ProductNameEnum.SimValidity === productVariant.productId.name) {
        const latestSimValidity = (await this.simService.getSimPlanBySimId(this.rechargePayload.sim)).find(
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
        ecommerceVariantId: productVariant,
        isExpired: false,
        simId: this.rechargePayload.sim,
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

  private async createSimActivity(queueResponse: object, productVariantId: EcommerceProductsVariant): Promise<void> {
    const simActivity = {
      eCommerceproductVariantId: productVariantId,
      queueId: queueResponse?.['MessageId'],
      simId: this.rechargePayload.sim,
    };

    this.rechargePayload['simActivityId'] = await this.simService.createSimActivity(simActivity);
  }

  async updateCustomerReferral(): Promise<void> {
    if (this.rechargePayload?.customerReferralId) {
      const referral = await this.simService.findCustomerReferralById(this.rechargePayload.customerReferralId);
      await this.simService.updateCustomerReferral(referral, {
        isTopupDone: true,
        topupDate: new Date(),
      });
    }
  }

  async rechargeProcess(): Promise<void> {
    const simDocument = await this.simService.getSimById(this.rechargePayload?.simId);
    const simPlans = await this.simService.getSimPlanBySimId(simDocument);

    const productVariants = (await this.simService.getVariantsByIds(this.rechargePayload.checkoutId.productsVariantId)) as EcommerceProductsVariant[];
    const rechargePayload = {
      simType: SimType.eSIM,
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
      simId: simDocument.id,
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

        const queue = await this.queueProcess(SQSTypes.eCommerceRecharge, rechargePayload);
        await this.createSimActivity(queue, variant);
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

        const queue = await this.queueProcess(SQSTypes.eCommerceRecharge, rechargePayload); // If customer selected airtime for recharge we push to queue process the recharge.
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
        const queue = await this.queueProcess(SQSTypes.eCommerceRecharge, rechargePayload); // If customer selected airtime for recharge we push to queue process the recharge.
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
