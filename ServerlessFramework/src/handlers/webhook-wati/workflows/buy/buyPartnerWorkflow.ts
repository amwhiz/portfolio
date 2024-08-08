import SimService from '@handlers/sim/sim';
import { AppError } from '@libs/api-error';
import { KeyType } from '@aw/env';
import { LoggerService } from '@aw/logger';
import { PaymentProcessor } from '@aw/pg';
import { PeachPayment } from '@aw/pg/aw-peach';
import { CurrencySymbol } from '@aw/pg/enums/regionCurrency';
import { PaymentProvider } from '@aw/pg/interfaces/paymentProvider';
import { CheckoutPayload } from '@aw/pg/types/checkout';
import { ConfigurationService } from 'src/configurations/configService';
import { SQSTypes } from 'src/constants/sqs';
import { Templates } from 'src/constants/templates';
import { Customer, Checkout, ProductsVariant, SimPlan, Sim } from 'src/entities';
import { configurationsEnum } from 'src/entities/enums/configuration';
import { ProductVariantCurrencyEnum, ProductVariantSkuEnum } from 'src/entities/enums/productVariant';
import { Actions } from 'src/enums/actions';
import { CRMWorkFlow, ParentWorkflow } from 'src/enums/workflows';
import { dateNow, dateType, formatDate } from 'src/helpers/dates';
import { removePaymentLinkDomain } from 'src/helpers/removeDomain';
import { BaseProperties } from '../baseProperties';
import { WorkflowBase } from '../pushToQueue';
import { IBuyPartnerBuilder } from './interfaces/buyBuilder';
import { doorDelivery, IBuySim } from './interfaces/buySim';
import { OrderBuilder, OrderSimBuilder } from '@handlers/order/order';
import { Configuration } from 'src/entities/configuration';
import ValidatorBase from '@handlers/validator/validator';
import { ValidationRequestType } from '@handlers/validator/types/validator';
import { ValidationTypes } from '@handlers/validator/enum/validation';
import { SimTypesEnum } from 'src/entities/enums/common';
import { ExpireTimes } from 'src/constants/expireTime';
import { StripePayment } from '@aw/pg/aw-stripe';
import { Countries } from 'src/constants/countries';
import { PaymentTypes } from '@handlers/payments/enums/paymentStatus';
import { RegionBasedCurrency, currencyBasedHome } from '@handlers/portal/constants/regionBasedCurrency';
import { SourceEnum } from 'src/entities/enums/customer';

export class BuyPartnerSim {
  public async buildPayload<T>(builder: IBuyPartnerBuilder, payload: T): Promise<void> {
    await builder.setDefaultProperties(payload);
    await builder.setProducts();
    await builder.generatePaymentLink();
    await builder.updateCheckout();
    await builder.createOrders();
  }
}

export class BuyPartnerSimPayload extends BaseProperties {
  customerId?: Customer;
  checkoutId?: Checkout;
  line1: string = '';
  line2: string = '';
  city: string = '';
  postalCode: string = '';
  home: string = '';
  destination: string = '';
  state: string = '';
  country: string = '';
  products?: number[];
  totalPrice?: number | string = 0;
  airtime: string;
  validity?: string;
  passportNo?: string;
  link?: string | void;
  serialNumber?: string; // Need for 'already have a sim' flow
  isDoorDelivery?: doorDelivery;
  doorDelivery?: string;
  selectedOption?: string;
  simPlanPlan?: SimPlan;
  simPlanAirtime?: SimPlan;
  simPlanValidity?: SimPlan;
  simId?: Sim;
  selectedPlan?: Partial<ProductsVariant>;
  isCollectionPoint?: boolean;
  sources?: SourceEnum;
}

export class BuyPartnerBuilder extends WorkflowBase implements IBuyPartnerBuilder {
  private buySIM: BuyPartnerSimPayload;
  private simService: SimService;
  private configService: ConfigurationService;
  private logger = new LoggerService({ serviceName: BuyPartnerBuilder.name });
  private needToPayAddition: boolean = false;
  private airtimeVariant: ProductsVariant;
  private doorDeliveryVariant: ProductsVariant;
  private partnerFree: string[] = ['partnerFreeDelivery', 'partnerFreeCollection', 'partnerFreeEsim', 'partnerFreePsim'];

  constructor() {
    super();
    this.simService = new SimService();
    this.configService = ConfigurationService.getInstance();
  }

  private checkIsFreeSim(): void {
    if (this.buySIM.plan === ProductVariantSkuEnum['1GbFreeOffer']) this.buySIM.validity = ProductVariantSkuEnum['30Days-Free'];
    if (this.buySIM.isDoorDelivery === 'yes')
      this.buySIM.doorDelivery =
        this.buySIM.customerId.accountId.zone === 0 ? ProductVariantSkuEnum['doorDelivery-R99'] : ProductVariantSkuEnum['doorDelivery-$5'];
  }

  async setDefaultProperties(payload: IBuySim): Promise<void> {
    payload['selectedOption'] = `${payload?.selectedOption}`.toLowerCase() === 'yes' ? '1' : payload?.selectedOption;

    await this.simService.ormInit();
    const customer = await this.simService.getCustomerByEmail(payload?.email);

    const validator = new ValidatorBase(payload as ValidationRequestType);
    await validator.ormInit();
    const checkouts = await validator.getPlansByCheckout(
      customer,
      this.partnerFree.includes(payload?.flowName) ? ValidationTypes.partnerFreeSim : ValidationTypes.partnerBuySim
    );

    const selectedCheckout = checkouts[+payload?.selectedOption - 1];

    this.needToPayAddition = !!payload?.airtime || payload?.isDoorDelivery?.toLowerCase() === 'yes';

    this.buySIM = {
      selectedPlan: selectedCheckout,
      email: payload.email,
      whatsappNumber: payload?.whatsappNumber,
      destination: <string>payload?.destination,
      home: <string>payload?.home,
      plan: selectedCheckout?.sku,
      planStartDate: selectedCheckout?.checkoutId?.planStartDate,
      simType: payload?.simType,
      flowName: <string>payload?.flowName,
      parentName: <string>payload?.parentFlowName,
      deviceType: <string>payload.deviceType,
      device: payload.device,
      line1: <string>payload?.line1,
      line2: <string>payload?.line2,
      city: payload?.city,
      country: <string>payload?.country,
      postalCode: <string>payload?.postalCode,
      state: <string>payload?.state,
      airtime: <string>payload?.airtime,
      serialNumber: payload?.serialNumber,
      checkoutId: selectedCheckout.checkoutId,
      isDoorDelivery: <doorDelivery>payload?.isDoorDelivery?.toLowerCase(),
      customerId: customer,
      isCollectionPoint: payload?.isCollectionPoint?.toLowerCase() === 'yes',
    };
  }

  async setProducts(): Promise<void> {
    this.checkIsFreeSim();
    const productVariants: string[] = <string[]>[this.buySIM.airtime, this.buySIM.doorDelivery].filter((notNull) => notNull);

    if (this.buySIM.airtime) {
      this.airtimeVariant = await this.simService.getProductVariantBySku(this.buySIM.airtime as ProductVariantSkuEnum);
    }

    if (this.buySIM.doorDelivery) {
      this.doorDeliveryVariant = await this.simService.getProductVariantBySku(this.buySIM.doorDelivery as ProductVariantSkuEnum);
    }
    const products = await this.simService.getProductVariantsBySku(productVariants as ProductVariantSkuEnum[]);

    this.buySIM.products = products.map((variants) => variants.id);
    this.buySIM.totalPrice = products.map((variants) => variants.price).reduce((a, b) => a + b, 0);
  }

  async refreshToken(token: string): Promise<string> {
    const configures = (await this.simService.getConfigurations()).find((key) => key.option_name === configurationsEnum.peachToken);
    const updateTokenHour: number = new Date(configures?.updatedAt).getTime();
    const currentHour: number = (dateNow('Date') as Date).getTime();

    const timeDifferenceInMilliseconds = currentHour - updateTokenHour;

    const timeDifferenceInHours = timeDifferenceInMilliseconds / (1000 * 60 * 60);
    this.logger.info(`Time difference between current and token update: ${timeDifferenceInHours} hours`);
    /**
     * Token updated date lesser than current hours based on the platform.
     * Generator new Token and update in token record.
     */

    if (timeDifferenceInHours < 0 || timeDifferenceInHours > 2) {
      const paymentProvider: PaymentProvider = new PeachPayment();
      const process = new PaymentProcessor(paymentProvider);

      const updatedToken: {
        access_token: string;
        expires_in?: number;
      } = await process.auth();

      if (!updatedToken?.access_token) throw new AppError('Unable to refresh token, Please try again later');

      const updateConfig = {
        option_name: configurationsEnum['peachToken'],
        option_value: updatedToken['access_token'],
        updatedAt: <Date>dateNow('Date'),
      };
      await this.simService.updateConfiguration(configures, updateConfig as Partial<Configuration>);

      return updatedToken?.access_token;
    }

    return token;
  }

  private async swapPaymentService(country: string): Promise<PaymentProcessor> {
    let paymentProvider: PaymentProvider;
    if (Countries.Africa === country) {
      const oldAccessToken = (await this.configService.getValue('peachToken')) as string;
      const newAccessToken = await this.refreshToken(oldAccessToken);
      paymentProvider = new PeachPayment(newAccessToken);
    } else {
      paymentProvider = new StripePayment();
    }

    return new PaymentProcessor(paymentProvider);
  }

  async generatePaymentLink(): Promise<void> {
    if (this.needToPayAddition) {
      const currency = RegionBasedCurrency[this.buySIM.customerId?.accountId?.zone] ?? ProductVariantCurrencyEnum.ZAR;
      const process = await this.swapPaymentService(currencyBasedHome[currency]);

      const paymentDetails: CheckoutPayload = {
        amount: this.buySIM.totalPrice as number,
        email: this.buySIM.email,
        productName: this.buySIM.plan as ProductVariantSkuEnum,
        currency: currency,
        customerName: this.buySIM.customerId.firstName,
        invoiceId: `${this.buySIM.checkoutId.id}`,
        whatsapp: this.buySIM.whatsappNumber,
        expiryTime: ExpireTimes.customerPayment,
      };

      const notes = {
        checkoutId: this.buySIM.checkoutId.id,
        planStartDate: formatDate(dateType(this.buySIM.planStartDate)),
        type: ParentWorkflow.Activation,
        simId: null,
        airtime: this.buySIM.airtime,
        validity: this.buySIM.validity,
        plan: this.buySIM.plan,
        serialNumber: this.buySIM.serialNumber,
        device: this.buySIM?.device,
      };

      this.buySIM.link = await process.createCheckout(paymentDetails, notes);

      const templateName = currency === ProductVariantCurrencyEnum.USD ? Templates.sendStripePaymentLink : Templates.sendPeachPaymentLink;

      await this.queueProcess(
        SQSTypes.notification,
        {
          totalPrice: `${CurrencySymbol[currency]}${this.buySIM.totalPrice}`,
          email: this.buySIM.email,
          link: removePaymentLinkDomain(this.buySIM.link as string),
          action: Actions.Wati,
          whatsappNumber: this.buySIM.whatsappNumber,
        },
        templateName
      );
    }
  }

  async createAddress(): Promise<void> {
    const address = {
      address: `${this.buySIM?.line1 || ''},${this.buySIM?.line2 || ''}`,
      city: this.buySIM?.city,
      country: this.buySIM?.country,
      customerId: this.buySIM?.customerId,
      postalCode: this.buySIM?.postalCode,
      province: this.buySIM?.state,
    };

    if (!this.buySIM?.line1) return;

    await this.simService.createAddress(address);
  }

  async updateCheckout(): Promise<void> {
    const checkout = await this.simService.getCheckoutById(this.buySIM.checkoutId.id);
    const isPaid = !this.needToPayAddition;
    const updateCheckout: Partial<Checkout> = {
      paymentLink: <string>this.buySIM.link,
      productsVariantId: checkout.productsVariantId,
      totalPrice: checkout.totalPrice + (<number>this.buySIM?.totalPrice ?? 0),
      simType: SimTypesEnum[this.buySIM.simType],
      isPaid: isPaid,
      isCompleted: isPaid,
      countryFrom: this.buySIM?.home,
      completedAt: isPaid ? <Date>dateNow('Date') : null,
      paidAt: isPaid ? <Date>dateNow('Date') : null,
      isDoorDelivery: this.buySIM.isDoorDelivery?.toLowerCase() === 'yes',
      countryTravelTo: this.buySIM?.destination,
      source: SourceEnum.Chatbot,
    };

    if (this.airtimeVariant) checkout.productsVariantId.push(this.airtimeVariant.id);
    if (this.doorDeliveryVariant) checkout.productsVariantId.push(this.doorDeliveryVariant.id);

    this.buySIM.checkoutId = await this.simService.updateCheckoutById(checkout, updateCheckout);

    if (isPaid) {
      const crmPayload = {
        checkoutId: checkout?.id,
        flowName: CRMWorkFlow.Payment,
        paymentStatus: PaymentTypes.completed,
        isDoorDelivery: this.buySIM.isDoorDelivery?.toLowerCase() === 'yes',
      };
      await this.queueProcess(SQSTypes.crm, crmPayload);
    }

    if (this.buySIM?.line1) await this.createAddress();
  }

  async createOrders(): Promise<void> {
    if (!this.needToPayAddition) {
      const orderBuilder = new OrderSimBuilder();
      this.buySIM.sources = SourceEnum.Chatbot;
      const order = await orderBuilder.buildPayload(new OrderBuilder(), this.buySIM);
      this.buySIM.simId = order.simId;
      this.buySIM.simPlanPlan = order.simPlanPlan;
      this.buySIM.simPlanAirtime = order.simPlanAirtime;
      this.buySIM.simPlanValidity = order.simPlanValidity;

      await this.instantsActivations();
    }
  }

  async getProductVariantById(variantId: number): Promise<ProductsVariant> {
    const variants = await this.simService.getProductVariantsByIds([variantId]);
    return variants?.length ? variants[0] : null;
  }

  async createSimActivity(queueResponse: object, productVariantId: ProductsVariant): Promise<void> {
    const simActivity = {
      productVariantId: productVariantId,
      queueId: queueResponse?.['MessageId'],
      simId: this.buySIM.simId,
    };

    this.buySIM['simActivityId'] = await this.simService.createSimActivity(simActivity);
  }

  async instantsActivations(): Promise<void> {
    // * * If the SIM type is eSIM and the pick-up option is selected, instant activations are not necessary.
    if (!this.buySIM.isCollectionPoint) {
      const activationPayload = {
        simType: SimTypesEnum[this.buySIM.simType] === SimTypesEnum.eSIM ? SimTypesEnum.eSIM : SimTypesEnum.pSIM,
        serialNumber: this.buySIM?.serialNumber,
        email: this.buySIM.email,
        whatsappNumber: this.buySIM.whatsappNumber,
        planStartDate: formatDate(dateType(this.buySIM.planStartDate)),
        checkoutId: this.buySIM?.['checkoutId'],
        parentFlowName: ParentWorkflow.Activation,
        simId: this.buySIM.simId,
        simPlanPlan: this.buySIM.simPlanPlan,
        simPlanAirtime: this.buySIM.simPlanAirtime,
        simPlanValidity: this.buySIM.simPlanValidity,
        plan: this.buySIM?.plan,
        device: this.buySIM.device,
      };

      if (this.buySIM?.selectedPlan?.id) {
        const queue = await this.queueProcess(SQSTypes.workflow, activationPayload);
        await this.createSimActivity(queue, this.buySIM?.selectedPlan as ProductsVariant);
      }
    } else {
      await this.queueProcess(
        SQSTypes.notification,
        {
          whatsappNumber: this.buySIM.whatsappNumber,
          action: Actions.Wati,
        },
        Templates.collectionPoint
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async queueProcess(queueName: KeyType, notificationData: object = {}, templateName?: string): Promise<any> {
    await super.pushToQueue(queueName, {
      templateName,
      ...notificationData,
    });

    // Delay the execution 3 seconds, Otherwise notification receiving order might be changed.
    await super.delay(2000);
  }
}
