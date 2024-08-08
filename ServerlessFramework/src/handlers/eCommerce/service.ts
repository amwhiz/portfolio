/* eslint-disable @typescript-eslint/no-explicit-any */
import { Checkout, Customer, Order, Sim, SimPlan } from 'src/entities';
import { SimType, SimTypesEnum } from 'src/entities/enums/common';
import { ProductNameEnum } from 'src/entities/enums/product';
import { ProductVariantSkuEnum } from 'src/entities/enums/productVariant';
import { SimStatusEnum } from 'src/entities/enums/sim';
import { dateNow, findAndConvertDate, addDayAndFormat, minusOneDay, formatDate, dateType, hubspotFormatDate } from 'src/helpers/dates';
import SimService from '@handlers/sim/sim';
import { SourceEnum } from 'src/entities/enums/customer';
import { CRMWorkFlow, WorkflowEnum } from 'src/enums/workflows';
import { SQSTypes } from 'src/constants/sqs';
import { KeyType } from '@aw/env';
import { OrderType } from 'src/entities/enums/order';
import { IEcommerceBuilder } from './interfaces/builder';
import { BaseProperties } from '@handlers/webhook-wati/workflows/baseProperties';
import { WorkflowBase } from '@handlers/webhook-wati/workflows/pushToQueue';
import { LoggerService } from '@aw/logger';
import { OrderData } from './interfaces/order';
import { eCommerceRequestBuild } from 'src/build/eCommerce';
import { generateReferralCode } from 'src/helpers/generateReferralCode';
import { BalanceBuilder } from './balance/balanceWorkflow';
import { BalanceNotificationType } from './balance/types/balanceNotificationType';
import { CustomerReferral } from 'src/entities/customerReferral';
import { CustomerSourceEnum } from 'src/entities/enums/customerReferral';
import { SimResponseType } from './types/sim';
import { EcommerceProductsVariant } from 'src/entities/eCommerceProductVariant';
import { ActivationSim, ActivationBuilder } from './activation/activationWorkflow';
import { ActivationResponseType } from './activation/types/activation';
import { RechargePayload } from './topup/topup';
import { RechargeRequest } from './types/recharge';
import { PaymentTypes } from '@handlers/payments/enums/paymentStatus';

export class ECommerceBuySim {
  public async buildPayload<T>(builder: IEcommerceBuilder, payload: T): Promise<void> {
    await builder.setDefaultProperties(payload);
    await builder.createCustomer();
    await builder.createCustomerReferral();
    await builder.createAddress();
    await builder.setProducts();
    await builder.createCheckout();
    await builder.createOrder();
    await builder.createLineItems();
    await builder.createSim();
    await builder.createSimPlans();
  }
}

export class ECommerceProperties extends BaseProperties {
  customerId?: Customer;
  checkoutId?: Checkout;
  line1?: string = null;
  line2?: string = null;
  city?: string = null;
  postalCode?: string = null;
  home?: string = null;
  destination?: string = null;
  state?: string = null;
  country?: string = null;
  products?: number[];
  totalPrice?: number = 0;
  airtime?: string;
  validity?: string;
  link?: string;
  serialNumber?: string; // Need for 'already have a sim' flow
  orderId?: Order;
  simId?: Sim;
  productVariants?: number[];
  simPlanPlan?: SimPlan;
  simPlanValidity?: SimPlan;
  simPlanAirtime?: SimPlan;
  variantId?: string;
  orderNumber?: string;
  source?: string;
  referralCode?: string;
  referralSource?: CustomerSourceEnum;
  simName?: string;
  simType: SimType.eSIM;
  selectedPlan: string;
}

export class ECommerceBuilder extends WorkflowBase implements IEcommerceBuilder {
  private simService: SimService;
  private eCommerceSim: ECommerceProperties;
  private event = {};
  private eCommercePrePaid = true;

  constructor() {
    super();
    this.simService = new SimService();
  }

  async setDefaultProperties(payload: OrderData): Promise<void> {
    await this.simService.ormInit();

    this.eCommerceSim = {
      firstName: payload?.firstName,
      lastName: payload?.lastName,
      email: payload.email,
      whatsappNumber: payload?.whatsappNumber,
      home: payload?.home,
      plan: payload?.plan,
      planStartDate: formatDate(dateType(new Date())),
      flowName: WorkflowEnum.shopify,
      parentName: WorkflowEnum.shopify,
      deviceType: payload.deviceType,
      line1: payload?.line1,
      line2: payload?.line2,
      city: payload?.city,
      country: payload?.country,
      postalCode: payload?.postalCode,
      state: payload?.state,
      airtime: payload?.airtime,
      validity: payload?.validity,
      referralCode: payload?.referralCode,
      referralSource: payload?.referralSource,
      simName: payload?.simName,
      simType: SimType.eSIM,
      selectedPlan: payload?.extraPlan,
      totalPrice: payload?.amount,
      destination: payload?.destination,
    };
  }

  async createCustomer(): Promise<void> {
    const customer = await this.simService.getCustomerByEmail(this.eCommerceSim.email);
    if (!customer?.id || !customer.referralCode) {
      const customers = {
        email: this.eCommerceSim.email,
        firstName: this.eCommerceSim.firstName,
        lastName: this.eCommerceSim.lastName,
        source: SourceEnum.Shopify,
        whatsapp: this.eCommerceSim.whatsappNumber,
        referralCode: generateReferralCode(),
        createdAt: <Date>dateNow('Date'),
        updatedAt: <Date>dateNow('Date'),
      };

      const customerDocument = await this.simService.createCustomer(customers);
      this.eCommerceSim.customerId = customerDocument;
    } else {
      this.eCommerceSim.customerId = customer;
    }
  }

  async createAddress(): Promise<void> {
    const address = {
      address: `${this.eCommerceSim?.line1 || ''},${this.eCommerceSim?.line2 || ''}`,
      city: this.eCommerceSim?.city,
      country: this.eCommerceSim?.country,
      customerId: this.eCommerceSim?.customerId,
      postalCode: this.eCommerceSim?.postalCode,
      province: this.eCommerceSim?.state,
    };

    if (!this.eCommerceSim?.line1) return;

    await this.simService.createAddress(address);
  }

  async setProducts(): Promise<void> {
    const productVariants: string[] = [
      this.eCommerceSim.plan,
      this.eCommerceSim.selectedPlan,
      this.eCommerceSim.airtime,
      this.eCommerceSim.validity,
    ].filter((notNull) => notNull);

    const products = await this.simService.getVariantsBySku(productVariants as ProductVariantSkuEnum[], this.eCommerceSim.home);
    this.eCommerceSim.products = products.map((variants) => variants.id);
  }

  getCheckoutPayload(): Checkout {
    return {
      completedAt: this.eCommercePrePaid ? (dateNow('Date') as Date) : null,
      countryFrom: this.eCommerceSim.home,
      countryTravelTo: this.eCommerceSim.destination,
      isCompleted: this.eCommercePrePaid,
      isPaid: this.eCommercePrePaid,
      totalPrice: this.eCommerceSim.totalPrice || 0,
      paidAt: this.eCommercePrePaid ? (dateNow('Date') as Date) : null,
      productsVariantId: this.eCommerceSim.products,
      simType: SimTypesEnum[SimType.eSIM],
      customerId: this.eCommerceSim.customerId,
      type: OrderType.Activation,
      source: SourceEnum.Shopify,
      flowName: this.eCommerceSim?.flowName,
      planStartDate: this.eCommerceSim.planStartDate,
    } as Checkout;
  }

  async createCheckout(): Promise<void> {
    const checkout: Checkout = this.getCheckoutPayload();
    const checkoutDocument = await this.simService.createCheckout(checkout);
    this.eCommerceSim.checkoutId = checkoutDocument;
    await this.queueProcess(SQSTypes.crm, {
      checkoutId: this.eCommerceSim.checkoutId?.id,
      flowName: CRMWorkFlow.Buy,
    });
  }

  async createOrder(): Promise<void> {
    const orderPayload = {
      countryFrom: this.eCommerceSim.checkoutId.countryFrom,
      countryTravelTo: this.eCommerceSim.checkoutId.countryTravelTo,
      customerId: this.eCommerceSim.checkoutId.customerId,
      orderDate: dateNow('Date') as Date,
      totalPrice: this.eCommerceSim.checkoutId.totalPrice,
      type: OrderType.Activation,
      source: SourceEnum.Shopify,
    } as Order;
    this.eCommerceSim['orderId'] = await this.simService.createOrder(orderPayload);
  }

  async getProductVariantById(variantId: number): Promise<EcommerceProductsVariant> {
    const variants = await this.simService.getVariantsByIds([variantId]);
    return variants?.length ? variants[0] : null;
  }

  async createLineItems(): Promise<void> {
    const products = this.eCommerceSim.checkoutId.productsVariantId;
    const totalProducts = products?.length;
    for (let i = 0; i < totalProducts; i++) {
      const productId = products[i];
      const productVariant = await this.getProductVariantById(productId);
      const lineItem = {
        orderId: this.eCommerceSim.orderId,
        price: productVariant.price,
        productId: productVariant.productId,
        ecommerceProductVariantId: productVariant,
      };
      await this.simService.createLineItem(lineItem);
    }
  }

  async createSim(): Promise<void> {
    const sim = {
      countryFrom: this.eCommerceSim.checkoutId.countryFrom,
      countryTravelTo: this.eCommerceSim.checkoutId.countryTravelTo,
      customerId: this.eCommerceSim.checkoutId.customerId,
      purchasedAt: dateNow('Date') as Date,
      simType: SimTypesEnum.eSIM,
      status: SimStatusEnum.NotActive,
      serialNumber: this.eCommerceSim?.serialNumber,
      isDoorDelivery: false, // * * Free Sim, Door Delivery default false.
      flowName: this.eCommerceSim.flowName,
      simName: this.eCommerceSim.simName,
    };

    this.eCommerceSim.simId = await this.simService.createSim(sim);
  }

  async createSimActivity(queueResponse: object, productVariantId: EcommerceProductsVariant): Promise<void> {
    const simActivity = {
      productVariantId: productVariantId,
      queueId: queueResponse?.['MessageId'],
      simId: this.eCommerceSim.simId,
    };

    this.event['simActivityId'] = await this.simService.createSimActivity(simActivity);
  }

  async createSimPlans(): Promise<void> {
    const products = this.eCommerceSim.checkoutId.productsVariantId;
    const totalProducts = products?.length;
    for (let i = 0; i < totalProducts; i++) {
      const productId = products[i];
      const productVariant = await this.getProductVariantById(productId);

      const convertedDate = findAndConvertDate(this.eCommerceSim.planStartDate);
      const simPlan = {
        startDate: addDayAndFormat(convertedDate, 0, 'date') as Date,
        expiryDate: addDayAndFormat(convertedDate, productVariant.validityPeriod, 'date') as Date,
        actionDate: minusOneDay(addDayAndFormat(convertedDate, productVariant.validityPeriod, 'date'), 'date') as Date,
        productId: productVariant.productId,
        ecommerceVariantId: productVariant,
        isExpired: false,
        simId: this.eCommerceSim.simId,
      };
      const simPlanDocument = await this.simService.crateSimPlan(simPlan);
      if (ProductNameEnum.UnlimitedPlans === productVariant.productId.name) {
        this.eCommerceSim.simPlanPlan = simPlanDocument;
      } else if (ProductNameEnum.SimValidity === productVariant.productId.name) {
        this.eCommerceSim.simPlanValidity = simPlanDocument;
      } else if (ProductNameEnum.AirTime === productVariant.productId.name) {
        this.eCommerceSim.simPlanAirtime = simPlanDocument;
      }
    }

    await this.queueProcess(SQSTypes.crm, {
      checkoutId: this.eCommerceSim.checkoutId?.id,
      flowName: CRMWorkFlow.Payment,
      paymentStatus: PaymentTypes.completed,
      isDoorDelivery: this.eCommerceSim.checkoutId?.isDoorDelivery,
    });
  }

  async createCustomerReferral(): Promise<void> {
    if (this.eCommerceSim?.referralCode) {
      const customer = await this.simService.getCustomerByUniqueColumn(this.eCommerceSim?.referralCode);
      const customerReferralCount = await this.simService.getCustomerReferralCount(customer.id);

      const customerReferral: Partial<CustomerReferral> = {
        customerId: this.eCommerceSim.customerId,
        referralCustomerId: customer,
        source: this.eCommerceSim.referralSource,
      };
      if (customerReferralCount > 0 && (customerReferralCount + 1) % 15 === 0)
        customerReferral['rewardData'] = await this.simService.getVariantBySku(ProductVariantSkuEnum['1Gb'], this.eCommerceSim.home);
      else if (customerReferralCount > 0 && (customerReferralCount + 1) % 10 === 0)
        customerReferral['rewardData'] = await this.simService.getVariantBySku(ProductVariantSkuEnum['500Mb'], this.eCommerceSim.home);
      else customerReferral['rewardData'] = await this.simService.getVariantBySku(ProductVariantSkuEnum['150Mb'], this.eCommerceSim.home);

      await this.simService.createCustomerReferral(customerReferral);
    }
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

export class ECommerceWebhook extends WorkflowBase {
  private logger = new LoggerService({ serviceName: ECommerceWebhook.name });
  private simService: SimService;

  constructor() {
    super();
    this.simService = new SimService();
  }

  async setProducts(payload): Promise<number[]> {
    const productVariants: string[] = [payload.plan, payload.extraPlan, payload.airtime, payload.validity].filter((notNull) => notNull);

    const products = await this.simService.getVariantsBySku(productVariants as ProductVariantSkuEnum[], payload.home);
    return products.map((variants) => variants.id);
  }

  getCheckoutPayload(sim: Sim, variants: number[], payload?: OrderData): Checkout {
    const eCommercePrePaid = true;

    return {
      completedAt: dateNow('Date') as Date,
      countryFrom: sim.countryFrom,
      countryTravelTo: sim.countryTravelTo,
      isCompleted: eCommercePrePaid,
      isPaid: eCommercePrePaid,
      totalPrice: payload?.amount ?? 0,
      paidAt: eCommercePrePaid ? (dateNow('Date') as Date) : null,
      productsVariantId: variants,
      simType: SimTypesEnum[SimType.eSIM],
      customerId: sim.customerId,
      type: OrderType.Recharge,
      source: SourceEnum.Shopify,
      flowName: WorkflowEnum.shopify,
      planStartDate: hubspotFormatDate(new Date()),
    } as Checkout;
  }

  buildRechargePayload(sim: Sim, checkout: Checkout, variants: number[], payload): Partial<RechargePayload> {
    return {
      planStartDate: checkout?.planStartDate,
      customerId: sim.customerId,
      simId: sim.id,
      sim: sim,
      checkoutId: checkout,
      productVariants: variants,
      plan: payload?.rewardData ?? payload?.extraPlan ?? payload?.plan,
      airtime: payload?.airtime,
      customerReferralId: +payload?.customerReferralId,
      type: OrderType.Recharge,
    };
  }

  async rewardRechargePayload(event): Promise<void> {
    const sim: Sim = await this.simService.getSimByMobileNumber(event?.mobileNo);
    const payload = {
      plan: event?.rewardData,
      home: sim.countryFrom,
    };
    const variants = await this.setProducts(payload);

    //checkout
    const checkoutPayload: Checkout = this.getCheckoutPayload(sim, variants);
    const checkout: Checkout = await this.simService.createCheckout(checkoutPayload);

    await this.queueProcess(SQSTypes.crm, {
      checkoutId: checkout.id as unknown as Checkout,
      flowName: CRMWorkFlow.Buy,
    });

    const rechargePayload = this.buildRechargePayload(sim, checkout, variants, event);
    await this.queueProcess(SQSTypes.eCommerceRecharge, rechargePayload);
    await this.queueProcess(SQSTypes.crm, {
      checkoutId: checkout?.id,
      flowName: CRMWorkFlow.Payment,
      paymentStatus: PaymentTypes.completed,
      isDoorDelivery: checkout?.isDoorDelivery,
      simId: sim?.simId,
    });
  }

  async webhook(event: any): Promise<void> {
    try {
      await this.simService.ormInit();

      //customer referral reward data recharge
      if (event?.type === OrderType.Recharge && event?.rewardData && event?.mobileNo) {
        return await this.rewardRechargePayload(event);
      }

      //parse shopify payload
      const shopify = eCommerceRequestBuild(event);

      if (shopify?.type === OrderType.Recharge && shopify?.mobileNo) {
        const sim: Sim = await this.simService.getSimByMobileNumber(shopify?.mobileNo);
        shopify.home = sim.countryFrom;
        const variants = await this.setProducts(shopify);

        const checkoutPayload: Checkout = this.getCheckoutPayload(sim, variants, shopify);
        const checkout: Checkout = await this.simService.createCheckout(checkoutPayload);

        await this.queueProcess(SQSTypes.crm, {
          checkoutId: checkout.id as unknown as Checkout,
          flowName: CRMWorkFlow.Buy,
        });

        const shopifyRechargePayload = this.buildRechargePayload(sim, checkout, variants, shopify);
        await this.queueProcess(SQSTypes.eCommerceRecharge, shopifyRechargePayload);
        await this.queueProcess(SQSTypes.crm, {
          checkoutId: checkout?.id,
          flowName: CRMWorkFlow.Payment,
          paymentStatus: PaymentTypes.completed,
          isDoorDelivery: checkout?.isDoorDelivery,
          simId: sim?.simId,
        });
      } else await this.queueProcess(SQSTypes.eCommerce, shopify);
    } catch (e) {
      this.logger.error('Unable push to queue', { error: e });
      return null;
    }
  }

  public async activationExecutive(event: { simId: string; email: string }): Promise<ActivationResponseType> {
    const activationBuilder = new ActivationSim();
    const response = await activationBuilder.buildPayload(new ActivationBuilder(), event);
    return response;
  }

  public async simUsageExecutive(event: { mobileNo: string; limit: string; offset: string }): Promise<BalanceNotificationType> {
    const executiveBalance = new BalanceBuilder(event);
    return await executiveBalance.checkBalance();
  }

  async me(email: string): Promise<Customer> {
    await this.simService.ormInit();
    return await this.simService.getCustomerByEmail(email);
  }

  public async getSimsByEmail(event: RechargeRequest): Promise<SimResponseType[] | Sim | string> {
    await this.simService.ormInit();

    if (event?.mobileNo) return await this.simService.getSimByMobileNumber(event.mobileNo);

    const customer = await this.simService.getCustomerByEmail(event?.email);
    if (!customer?.email) return [];

    const offset = Number(event?.offset || '1') - 1;
    const sims = await this.simService.getSimsByCustomer(customer, 20, offset);

    const simsWithValidity =
      (sims.map((sim) => ({
        ...sim,
        simValidity: ProductVariantSkuEnum['30Days-Free'],
      })) as SimResponseType[]) ?? [];

    if (event?.type === OrderType.Activation) {
      return simsWithValidity.filter((sim) => sim?.mobileNo && sim.status === (SimStatusEnum.Active || SimStatusEnum.PreActive)) ?? [];
    }

    return simsWithValidity;
  }

  public async updateSimName(event: { simId: string; offset: string; simName: string }): Promise<void> {
    await this.simService.ormInit();

    await this.simService.updateSim(+event?.simId, { simName: event?.simName });
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
