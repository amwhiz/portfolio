/* eslint-disable @typescript-eslint/no-explicit-any */
import { Checkout, Customer, Order, ProductsVariant, Sim, SimPlan } from 'src/entities';
import { SimTypesEnum } from 'src/entities/enums/common';
import { ProductNameEnum } from 'src/entities/enums/product';
import { ProductVariantNameEnum, ProductVariantSkuEnum } from 'src/entities/enums/productVariant';
import { SimStatusEnum } from 'src/entities/enums/sim';
import { dateNow, findAndConvertDate, addDayAndFormat, minusOneDay, formatDate, dateType } from 'src/helpers/dates';
import SimService from '@handlers/sim/sim';
import { omit } from 'lodash';
import { getNames } from 'src/helpers/getNames';
import { SourceEnum } from 'src/entities/enums/customer';
import { CRMWorkFlow, ParentWorkflow, WorkflowEnum } from 'src/enums/workflows';
import { SQSTypes } from 'src/constants/sqs';
import { ConfigurationService } from 'src/configurations/configService';
import { KeyType } from '@aw/env';
import { OrderType } from 'src/entities/enums/order';
import { IShopifyBuilder } from './interfaces/builder';
import { BaseProperties } from '@handlers/webhook-wati/workflows/baseProperties';
import { WorkflowBase } from '@handlers/webhook-wati/workflows/pushToQueue';
import { LoggerService } from '@aw/logger';
import { ShopifyVariants } from 'src/types/configuration';
import { shopifyRequestBuild } from 'src/build/shopify';
import { OrderData } from './interfaces/order';

export class ShopifyBuySim {
  public async buildPayload<T>(builder: IShopifyBuilder, payload: T): Promise<void> {
    await builder.setDefaultProperties(payload);
    await builder.createCustomer();
    await builder.createAddress();
    await builder.setProducts();
    await builder.createCheckout();
    await builder.createOrder();
    await builder.createLineItems();
    await builder.createSim();
    await builder.createSimPlans();
    await builder.instantsActivations();
  }
}

export class ShopifyProperties extends BaseProperties {
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
}

export class ShopifyBuilder extends WorkflowBase implements IShopifyBuilder {
  private simService: SimService;
  private shopifySim: ShopifyProperties;
  private event = {};
  private configService: ConfigurationService;
  private shopifyPrePaid = true;

  private plans: ProductVariantNameEnum[] = [ProductVariantNameEnum.UnlimitedPlans];
  private productPlans: string[] = Object.values(omit(ProductNameEnum, 'SimValidity'));

  constructor() {
    super();
    this.simService = new SimService();
    this.configService = ConfigurationService.getInstance();
  }

  async setDefaultProperties(payload: OrderData): Promise<void> {
    const { firstName, lastName } = getNames(payload.customerName);
    await this.simService.ormInit();

    const shopifyVariants = await this.configService.getValue('shopifyVariants');
    const variant: ShopifyVariants[0] = shopifyVariants[payload?.variantId];

    this.shopifySim = {
      firstName: firstName,
      lastName: lastName,
      email: payload.email,
      whatsappNumber: payload?.whatsappNumber,
      home: payload?.home,
      plan: variant.plan,
      planStartDate: formatDate(dateType(payload?.planStartDate)),
      simType: payload?.simType,
      flowName: WorkflowEnum.shopify,
      parentName: WorkflowEnum.shopify,
      deviceType: payload.deviceType,
      device: payload.device,
      line1: payload?.line1,
      line2: payload?.line2,
      city: payload?.city,
      country: payload?.country,
      postalCode: payload?.postalCode,
      state: payload?.state,
      airtime: variant.airtime,
      validity: payload?.validity,
      serialNumber: payload?.serialNumber,
    };
  }

  async createCustomer(): Promise<void> {
    const customers = {
      email: this.shopifySim.email,
      firstName: this.shopifySim.firstName,
      lastName: this.shopifySim.lastName,
      source: SourceEnum.Shopify,
      whatsapp: this.shopifySim.whatsappNumber,
      createdAt: <Date>dateNow('Date'),
      updatedAt: <Date>dateNow('Date'),
    };

    const customerDocument = await this.simService.createCustomer(customers);
    this.shopifySim.customerId = customerDocument;
  }

  async createAddress(): Promise<void> {
    const address = {
      address: `${this.shopifySim?.line1 || ''},${this.shopifySim?.line2 || ''}`,
      city: this.shopifySim?.city,
      country: this.shopifySim?.country,
      customerId: this.shopifySim?.customerId,
      postalCode: this.shopifySim?.postalCode,
      province: this.shopifySim?.state,
    };

    if (!this.shopifySim?.line1) return;

    await this.simService.createAddress(address);
  }

  async setProducts(): Promise<void> {
    // For India
    const productVariants: string[] = [this.shopifySim.plan, this.shopifySim.airtime, this.shopifySim.validity].filter((notNull) => notNull);

    const products = await this.simService.getProductVariantsBySku(productVariants as ProductVariantSkuEnum[]);
    this.shopifySim.products = products.map((variants) => variants.id);
    this.shopifySim.totalPrice = products.map((variants) => variants.price).reduce((a, b) => a + b, 0);
  }

  getCheckoutPayload(): Checkout {
    return {
      completedAt: this.shopifyPrePaid ? (dateNow('Date') as Date) : null,
      countryFrom: this.shopifySim.home,
      countryTravelTo: this.shopifySim.destination,
      isCompleted: this.shopifyPrePaid,
      isPaid: this.shopifyPrePaid,
      totalPrice: this.shopifySim.totalPrice || 0,
      paidAt: this.shopifyPrePaid ? (dateNow('Date') as Date) : null,
      productsVariantId: this.shopifySim.products,
      simType: SimTypesEnum[this.shopifySim.simType],
      customerId: this.shopifySim.customerId,
      type: OrderType.Activation,
      source: SourceEnum.Shopify,
      flowName: this.shopifySim?.flowName,
      planStartDate: this.shopifySim.planStartDate,
    } as Checkout;
  }

  async createCheckout(): Promise<void> {
    const checkout: Checkout = this.getCheckoutPayload();
    const checkoutDocument = await this.simService.createCheckout(checkout);
    this.shopifySim.checkoutId = checkoutDocument;
  }

  async createOrder(): Promise<void> {
    const orderPayload = {
      countryFrom: this.shopifySim.checkoutId.countryFrom,
      countryTravelTo: this.shopifySim.checkoutId.countryTravelTo,
      customerId: this.shopifySim.checkoutId.customerId,
      orderDate: dateNow('Date') as Date,
      totalPrice: this.shopifySim.checkoutId.totalPrice,
      type: OrderType.Activation,
      source: SourceEnum.Shopify,
    } as Order;
    this.shopifySim['orderId'] = await this.simService.createOrder(orderPayload);
  }

  async getProductVariantById(variantId: number): Promise<ProductsVariant> {
    const variants = await this.simService.getProductVariantsByIds([variantId]);
    return variants?.length ? variants[0] : null;
  }

  async createLineItems(): Promise<void> {
    const products = this.shopifySim.checkoutId.productsVariantId;
    const totalProducts = products?.length;
    for (let i = 0; i < totalProducts; i++) {
      const productId = products[i];
      const productVariant = await this.getProductVariantById(productId);
      const lineItem = {
        orderId: this.shopifySim.orderId,
        price: productVariant.price,
        productId: productVariant.productId,
        productVariantId: productVariant,
      };
      await this.simService.createLineItem(lineItem);
    }
  }

  async createSim(): Promise<void> {
    const sim = {
      countryFrom: this.shopifySim.checkoutId.countryFrom,
      countryTravelTo: this.shopifySim.checkoutId.countryTravelTo,
      customerId: this.shopifySim.checkoutId.customerId,
      purchasedAt: dateNow('Date') as Date,
      simType: this.shopifySim.checkoutId.simType === SimTypesEnum.pSIM ? SimTypesEnum.pSIM : SimTypesEnum.eSIM,
      status: SimStatusEnum.NotActive,
      serialNumber: this.shopifySim?.serialNumber,
      isDoorDelivery: false, // * * Free Sim, Door Delivery default false.
      flowName: this.shopifySim.flowName,
    };

    this.shopifySim.simId = await this.simService.createSim(sim);
  }

  async createSimActivity(queueResponse: object, productVariantId: ProductsVariant): Promise<void> {
    const simActivity = {
      productVariantId: productVariantId,
      queueId: queueResponse?.['MessageId'],
      simId: this.shopifySim.simId,
    };

    this.event['simActivityId'] = await this.simService.createSimActivity(simActivity);
  }

  async createSimPlans(): Promise<void> {
    const products = this.shopifySim.checkoutId.productsVariantId;
    const totalProducts = products?.length;
    for (let i = 0; i < totalProducts; i++) {
      const productId = products[i];
      const productVariant = await this.getProductVariantById(productId);

      const convertedDate = findAndConvertDate(this.shopifySim.planStartDate);
      const simPlan = {
        startDate: addDayAndFormat(convertedDate, 0, 'date') as Date,
        expiryDate: addDayAndFormat(convertedDate, productVariant.validityPeriod, 'date') as Date,
        actionDate: minusOneDay(addDayAndFormat(convertedDate, productVariant.validityPeriod, 'date'), 'date') as Date,
        productId: productVariant.productId,
        productVariantId: productVariant,
        isExpired: false,
        simId: this.shopifySim.simId,
      };
      const simPlanDocument = await this.simService.crateSimPlan(simPlan);
      if (this.productPlans.includes(productVariant.productId.name)) {
        this.shopifySim.simPlanPlan = simPlanDocument;
      } else if (ProductNameEnum.SimValidity === productVariant.productId.name) {
        this.shopifySim.simPlanValidity = simPlanDocument;
      }
    }
  }

  async instantsActivations(): Promise<void> {
    const isCollectionPoint = ((await this.configService.getValue('freeSimNotActivationFlow')) as string[]).includes(this.shopifySim.flowName);

    // * * If the SIM type is eSIM and the pick-up option is selected, instant activations are not necessary.
    if (!isCollectionPoint) {
      const activationPayload = {
        simType: SimTypesEnum[this.shopifySim.simType],
        serialNumber: this.shopifySim?.serialNumber,
        email: this.shopifySim.email,
        whatsappNumber: this.shopifySim.whatsappNumber,
        planStartDate: this.shopifySim.planStartDate,
        checkoutId: this.shopifySim?.['checkoutId'],
        parentFlowName: ParentWorkflow.Activation,
        simId: this.shopifySim.simId,
        simPlanPlan: this.shopifySim.simPlanPlan,
        simPlanAirtime: this.shopifySim.simPlanAirtime,
        simPlanValidity: this.shopifySim.simPlanValidity,
        plan: this.shopifySim?.plan,
        device: this.shopifySim.device,
      };

      const products = this.shopifySim.checkoutId.productsVariantId;

      for (let i = 0; i < products?.length; i++) {
        const variant = products[i];
        const productVariant = await this.getProductVariantById(variant);

        const isPlan = this.plans.includes(productVariant.name);
        if (isPlan) {
          const queue = await this.queueProcess(SQSTypes.workflow, activationPayload);
          await this.createSimActivity(queue, productVariant);
        }
      }
    }
    await this.queueProcess(SQSTypes.crm, {
      checkoutId: this.shopifySim.checkoutId.id as unknown as Checkout,
      flowName: CRMWorkFlow.Buy,
    });
    await this.simService.closeConnection();
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

export class ShopifyWebhook extends WorkflowBase {
  private logger = new LoggerService({ serviceName: ShopifyWebhook.name });
  private event: any;

  constructor(event: any) {
    super();
    this.event = event;
  }

  async webhook(): Promise<void> {
    try {
      const shopify = shopifyRequestBuild(this.event);

      await this.queueProcess(SQSTypes.shopify, shopify);
    } catch (e) {
      this.logger.error('Unable push to queue', { error: e });
      return null;
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
