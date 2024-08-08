import { Accounts, Checkout, Customer, Order, ProductsVariant, Sim, SimPlan } from 'src/entities';
import { SimTypesEnum } from 'src/entities/enums/common';
import { ProductNameEnum } from 'src/entities/enums/product';
import { ProductVariantNameEnum, ProductVariantSkuEnum } from 'src/entities/enums/productVariant';
import { SimStatusEnum } from 'src/entities/enums/sim';
import { dateNow, findAndConvertDate, addDayAndFormat, minusOneDay } from 'src/helpers/dates';
import { WorkflowBase } from '../pushToQueue';
import { IBuyFreeSimBuilder } from './interfaces/buyFreeSimBuilder';
import SimService from '@handlers/sim/sim';
import { BaseProperties } from '../baseProperties';
import { omit } from 'lodash';
import { getNames } from 'src/helpers/getNames';
import { IBuySim } from './interfaces/buySim';
import { SourceEnum } from 'src/entities/enums/customer';
import { CRMWorkFlow, ParentWorkflow, WorkflowEnum } from 'src/enums/workflows';
import { SQSTypes } from 'src/constants/sqs';
import { ConfigurationService } from 'src/configurations/configService';
import { KeyType } from '@aw/env';
import { OrderType } from 'src/entities/enums/order';
import { Actions } from 'src/enums/actions';
import { Templates } from 'src/constants/templates';
import { PaymentTypes } from '@handlers/payments/enums/paymentStatus';
import AccountService from '@handlers/account/account';

export class BuyFreeSim {
  public async buildPayload<T>(builder: IBuyFreeSimBuilder, payload: T): Promise<void> {
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

export class BuyFreeSimPayload extends BaseProperties {
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
  totalPrice?: number | string = 0;
  airtime?: string;
  validity?: string;
  passportNo?: string;
  link?: string;
  serialNumber?: string; // Need for 'already have a sim' flow
  orderId?: Order;
  simId?: Sim;
  productVariants?: number[];
  simPlanPlan?: SimPlan;
  simPlanValidity?: SimPlan;
  simPlanAirtime?: SimPlan;
  source?: SourceEnum;
  isCollectionPoint?: boolean;
  account?: Accounts;
}

export class BuyFreeSimBuilder extends WorkflowBase implements IBuyFreeSimBuilder {
  private simService: SimService;
  private buyFreeSim: BuyFreeSimPayload;
  private event = {};
  private configService: ConfigurationService;
  private accountService: AccountService;

  private plans: ProductVariantNameEnum[] = [ProductVariantNameEnum.UnlimitedPlans];
  private productPlans: string[] = Object.values(omit(ProductNameEnum, 'SimValidity'));

  constructor() {
    super();
    this.simService = new SimService();
    this.configService = ConfigurationService.getInstance();
  }

  async setDefaultProperties(payload: IBuySim): Promise<void> {
    const { firstName, lastName } = getNames(payload.customerName);
    await this.simService.ormInit();
    let account: Accounts;

    if (payload?.referralCode) {
      this.accountService = new AccountService();
      await this.accountService.ormInit();
      account = await this.accountService.findAccountByUniqueColumn(undefined, undefined, payload?.referralCode);
    }

    this.buyFreeSim = {
      firstName: firstName,
      lastName: lastName,
      email: payload.email,
      whatsappNumber: payload?.whatsappNumber,
      destination: payload?.destination,
      home: payload?.home,
      plan: payload?.plan,
      planStartDate: payload?.planStartDate,
      simType: payload?.simType,
      flowName: payload?.flowName,
      parentName: payload?.parentFlowName,
      deviceType: payload.deviceType,
      device: payload.device,
      line1: payload?.line1,
      line2: payload?.line2,
      city: payload?.city,
      country: payload?.country,
      postalCode: payload?.postalCode,
      state: payload?.state,
      airtime: payload?.airtime,
      validity: payload?.validity,
      serialNumber: payload?.serialNumber,
      account: account,
      source: payload.flowName === WorkflowEnum.airport ? SourceEnum.Airport : SourceEnum.Chatbot,
    };
  }

  async createCustomer(): Promise<void> {
    const customers = {
      email: this.buyFreeSim.email,
      firstName: this.buyFreeSim.firstName,
      lastName: this.buyFreeSim.lastName,
      source: this.buyFreeSim.source,
      whatsapp: this.buyFreeSim.whatsappNumber,
      createdAt: <Date>dateNow('Date'),
      updatedAt: <Date>dateNow('Date'),
    };

    if (this.buyFreeSim?.account) customers['accountId'] = this.buyFreeSim?.account;

    const customerDocument = await this.simService.createCustomer(customers);
    this.buyFreeSim.customerId = customerDocument;
  }

  async createAddress(): Promise<void> {
    const address = {
      address: `${this.buyFreeSim?.line1 || ''},${this.buyFreeSim?.line2 || ''}`,
      city: this.buyFreeSim?.city,
      country: this.buyFreeSim?.country,
      customerId: this.buyFreeSim?.customerId,
      postalCode: this.buyFreeSim?.postalCode,
      province: this.buyFreeSim?.state,
    };

    if (!this.buyFreeSim?.line1) return;

    await this.simService.createAddress(address);
  }

  async setProducts(): Promise<void> {
    // For India
    const productVariants: string[] = [this.buyFreeSim.plan, this.buyFreeSim.airtime, this.buyFreeSim.validity].filter((notNull) => notNull);

    const products = await this.simService.getProductVariantsBySku(productVariants as ProductVariantSkuEnum[]);
    this.buyFreeSim.products = products.map((variants) => variants.id);
    this.buyFreeSim.totalPrice = products.map((variants) => variants.price).reduce((a, b) => a + b, 0);
  }

  getCheckoutPayload(): Checkout {
    const isFreeSim = true;
    return {
      completedAt: isFreeSim ? (dateNow('Date') as Date) : null,
      countryFrom: this.buyFreeSim.home,
      countryTravelTo: this.buyFreeSim.destination,
      isCompleted: isFreeSim,
      isPaid: isFreeSim,
      totalPrice: this.buyFreeSim.totalPrice || 0,
      paidAt: isFreeSim ? (dateNow('Date') as Date) : null,
      productsVariantId: this.buyFreeSim.products,
      simType: SimTypesEnum[this.buyFreeSim.simType],
      customerId: this.buyFreeSim.customerId,
      type: OrderType.Activation,
      flowName: this.buyFreeSim.flowName,
      source: this.buyFreeSim.source,
      accountId: this.buyFreeSim?.account,
      planStartDate: this.buyFreeSim?.planStartDate,
    } as Checkout;
  }

  async createCheckout(): Promise<void> {
    const checkout: Checkout = this.getCheckoutPayload();
    const checkoutDocument = await this.simService.createCheckout(checkout);
    this.buyFreeSim.checkoutId = checkoutDocument;
  }

  async createOrder(): Promise<void> {
    const orderPayload = {
      countryFrom: this.buyFreeSim.checkoutId.countryFrom,
      countryTravelTo: this.buyFreeSim.checkoutId.countryTravelTo,
      customerId: this.buyFreeSim.checkoutId.customerId,
      orderDate: dateNow('Date') as Date,
      totalPrice: this.buyFreeSim.checkoutId.totalPrice,
      type: OrderType.Activation,
      source: this.buyFreeSim.source,
    } as Order;
    this.buyFreeSim['orderId'] = await this.simService.createOrder(orderPayload);
  }

  async getProductVariantById(variantId: number): Promise<ProductsVariant> {
    const variants = await this.simService.getProductVariantsByIds([variantId]);
    return variants?.length ? variants[0] : null;
  }

  async createLineItems(): Promise<void> {
    const products = this.buyFreeSim.checkoutId.productsVariantId;
    const totalProducts = products?.length;
    for (let i = 0; i < totalProducts; i++) {
      const productId = products[i];
      const productVariant = await this.getProductVariantById(productId);
      const lineItem = {
        orderId: this.buyFreeSim.orderId,
        price: productVariant.price,
        productId: productVariant.productId,
        productVariantId: productVariant,
      };
      await this.simService.createLineItem(lineItem);
    }
  }

  async createSim(): Promise<void> {
    const sim = {
      countryFrom: this.buyFreeSim.checkoutId.countryFrom,
      countryTravelTo: this.buyFreeSim.checkoutId.countryTravelTo,
      customerId: this.buyFreeSim.checkoutId.customerId,
      purchasedAt: dateNow('Date') as Date,
      simType: this.buyFreeSim.checkoutId.simType === SimTypesEnum.pSIM ? SimTypesEnum.pSIM : SimTypesEnum.eSIM,
      status: SimStatusEnum.NotActive,
      serialNumber: this.buyFreeSim?.serialNumber,
      isDoorDelivery: false, // * * Free Sim, Door Delivery default false.
      flowName: this.buyFreeSim.flowName,
      accountId: this.buyFreeSim?.account,
    } as Sim;

    this.buyFreeSim.simId = await this.simService.createSim(sim);
  }

  async createSimActivity(queueResponse: object, productVariantId: ProductsVariant): Promise<void> {
    const simActivity = {
      productVariantId: productVariantId,
      queueId: queueResponse?.['MessageId'],
      simId: this.buyFreeSim.simId,
    };

    this.event['simActivityId'] = await this.simService.createSimActivity(simActivity);
  }

  async createSimPlans(): Promise<void> {
    const products = this.buyFreeSim.checkoutId.productsVariantId;
    const totalProducts = products?.length;
    for (let i = 0; i < totalProducts; i++) {
      const productId = products[i];
      const productVariant = await this.getProductVariantById(productId);

      const convertedDate = findAndConvertDate(this.buyFreeSim.planStartDate);
      const simPlan = {
        startDate: addDayAndFormat(convertedDate, 0, 'date') as Date,
        expiryDate: addDayAndFormat(convertedDate, productVariant.validityPeriod, 'date') as Date,
        actionDate: minusOneDay(addDayAndFormat(convertedDate, productVariant.validityPeriod, 'date'), 'date') as Date,
        productId: productVariant.productId,
        productVariantId: productVariant,
        isExpired: false,
        simId: this.buyFreeSim.simId,
        isActive: productVariant.name === ProductVariantNameEnum.SimValidity ? true : false,
      } as SimPlan;
      const simPlanDocument = await this.simService.crateSimPlan(simPlan);
      if (this.productPlans.includes(productVariant.productId.name)) {
        this.buyFreeSim.simPlanPlan = simPlanDocument;
      } else if (ProductNameEnum.SimValidity === productVariant.productId.name) {
        this.buyFreeSim.simPlanValidity = simPlanDocument;
      }
    }
  }

  async instantsActivations(): Promise<void> {
    const isCollectionPoint = ((await this.configService.getValue('freeSimNotActivationFlow')) as string[]).includes(this.buyFreeSim.flowName);

    // * * If the SIM type is eSIM and the pick-up option is selected, instant activations are not necessary.
    if (!isCollectionPoint) {
      const activationPayload = {
        simType: this.buyFreeSim.checkoutId.simType,
        serialNumber: this.buyFreeSim?.serialNumber,
        email: this.buyFreeSim.email,
        whatsappNumber: this.buyFreeSim.whatsappNumber,
        planStartDate: this.buyFreeSim.planStartDate,
        checkoutId: this.buyFreeSim?.['checkoutId'],
        parentFlowName: ParentWorkflow.Activation,
        simId: this.buyFreeSim.simId,
        simPlanPlan: this.buyFreeSim.simPlanPlan,
        simPlanAirtime: this.buyFreeSim.simPlanAirtime,
        simPlanValidity: this.buyFreeSim.simPlanValidity,
        plan: this.buyFreeSim?.plan,
        device: this.buyFreeSim.device,
      };

      const products = this.buyFreeSim.checkoutId.productsVariantId;

      for (let i = 0; i < products?.length; i++) {
        const variant = products[i];
        const productVariant = await this.getProductVariantById(variant);

        const isPlan = this.plans.includes(productVariant.name);
        if (isPlan) {
          const queue = await this.queueProcess(SQSTypes.workflow, activationPayload);
          await this.createSimActivity(queue, productVariant);
        }
      }
    } else {
      await this.queueProcess(
        SQSTypes.notification,
        {
          whatsappNumber: this.buyFreeSim.whatsappNumber,
          action: Actions.Wati,
        },
        Templates.collectionPoint
      );
    }

    await this.queueProcess(SQSTypes.crm, {
      checkoutId: this.buyFreeSim.checkoutId.id as unknown as Checkout,
      flowName: CRMWorkFlow.Buy,
    });

    const crmPayload = {
      checkoutId: this.buyFreeSim.checkoutId.id as unknown as Checkout,
      flowName: CRMWorkFlow.Payment,
      paymentStatus: PaymentTypes.completed,
      isDoorDelivery: false,
    };
    await this.queueProcess(SQSTypes.crm, crmPayload);
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
