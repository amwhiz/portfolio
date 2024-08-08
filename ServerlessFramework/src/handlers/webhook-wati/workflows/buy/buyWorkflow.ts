import { IBuyBuilder } from './interfaces/buyBuilder';
import { Accounts, Checkout, Customer } from 'src/entities';
import { IBuySim, doorDelivery } from './interfaces/buySim';
import { SourceEnum } from 'src/entities/enums/customer';
import { ProductVariantCurrencyEnum, ProductVariantSkuEnum } from 'src/entities/enums/productVariant';
import { SimTypesEnum } from 'src/entities/enums/common';
import { PaymentProvider } from '@aw/pg/interfaces/paymentProvider';
import { PaymentProcessor } from '@aw/pg';
import { CheckoutPayload } from '@aw/pg/types/checkout';
import { WorkflowBase } from '../pushToQueue';
import { BaseProperties } from '../baseProperties';
import { getNames } from 'src/helpers/getNames';
import { KeyType } from '@aw/env';
import { Actions } from 'src/enums/actions';
import { CRMWorkFlow, ParentWorkflow, WorkflowEnum } from 'src/enums/workflows';
import { dateNow } from 'src/helpers/dates';
import { SQSTypes } from 'src/constants/sqs';
import SimService from '@handlers/sim/sim';
import { Templates } from 'src/constants/templates';
import { removePaymentLinkDomain } from 'src/helpers/removeDomain';
import { CurrencySymbol } from '@aw/pg/enums/regionCurrency';
import { PeachPayment } from '@aw/pg/aw-peach';
import { ConfigurationService } from 'src/configurations/configService';
import { LoggerService } from '@aw/logger';
import { AppError } from '@libs/api-error';
import { configurationsEnum } from 'src/entities/enums/configuration';
import { Configuration } from 'src/entities/configuration';
import { OrderType } from 'src/entities/enums/order';
import AccountService from '@handlers/account/account';
import { StripePayment } from '@aw/pg/aw-stripe';
import { Countries, CountriesBasedCurrency } from 'src/constants/countries';

export class BuySim {
  public async buildPayload<T>(builder: IBuyBuilder, payload: T): Promise<void> {
    await builder.setDefaultProperties(payload);
    await builder.createCustomer();
    await builder.createAddress();
    await builder.setProducts();
    await builder.createCheckout();
    await builder.generatePaymentLink();
  }
}

export class BuySimPayload extends BaseProperties {
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
  link?: string | void;
  serialNumber?: string; // Need for 'already have a sim' flow
  isDoorDelivery?: doorDelivery;
  doorDelivery?: string;
  account?: Accounts;
  source?: SourceEnum;
  isCollectionPoint?: string;
}

export class BuyBuilder extends WorkflowBase implements IBuyBuilder {
  private buySIM: BuySimPayload;
  private simService: SimService;
  private configService: ConfigurationService;
  private logger = new LoggerService({ serviceName: BuyBuilder.name });
  private accountService: AccountService;

  constructor() {
    super();
    this.simService = new SimService();
    this.configService = ConfigurationService.getInstance();
  }

  private checkIsFreeSim(): void {
    if (this.buySIM.plan === ProductVariantSkuEnum['1GbFreeOffer']) this.buySIM.validity = ProductVariantSkuEnum['30Days-Free'];
    if (this.buySIM.isDoorDelivery === 'yes')
      this.buySIM.doorDelivery =
        this.buySIM.home === Countries.Africa ? ProductVariantSkuEnum['doorDelivery-R99'] : ProductVariantSkuEnum['doorDelivery-$5'];
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

  async setDefaultProperties(payload: IBuySim): Promise<void> {
    const { firstName, lastName } = getNames(payload.customerName);
    await this.simService.ormInit();
    let account: Accounts;

    if (payload?.referralCode) {
      this.accountService = new AccountService();
      await this.accountService.ormInit();
      account = await this.accountService.findAccountByUniqueColumn(undefined, undefined, payload?.referralCode);
    }

    this.buySIM = {
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
      isDoorDelivery: <doorDelivery>payload?.isDoorDelivery?.toLowerCase(),
      account: account,
      source: payload.flowName === WorkflowEnum.airport ? SourceEnum.Airport : SourceEnum.Chatbot,
      isCollectionPoint: <doorDelivery>payload?.isCollectionPoint?.toLowerCase(),
    };
  }

  async createCustomer(): Promise<void> {
    const customers = {
      email: this.buySIM.email,
      firstName: this.buySIM.firstName,
      lastName: this.buySIM.lastName,
      source: this.buySIM.source,
      whatsapp: this.buySIM.whatsappNumber,
      createdAt: <Date>dateNow('Date'),
      updatedAt: <Date>dateNow('Date'),
    } as Customer;

    if (this.buySIM?.account) customers['accountId'] = this.buySIM?.account;

    const customerDocument = await this.simService.createCustomer(customers);
    this.buySIM.customerId = customerDocument;
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

  async setProducts(): Promise<void> {
    this.checkIsFreeSim();
    const productVariants: string[] = [this.buySIM.plan, this.buySIM.airtime, this.buySIM.validity, this.buySIM.doorDelivery].filter(
      (notNull) => notNull
    );

    const products = await this.simService.getProductVariantsBySku(productVariants as ProductVariantSkuEnum[]);

    this.buySIM.products = products.map((variants) => variants.id);
    this.buySIM.totalPrice = products.map((variants) => variants.price).reduce((a, b) => a + b, 0);
  }

  getCheckoutPayload(): Checkout {
    const isFreeSim = false;
    return {
      completedAt: isFreeSim ? (dateNow('Date') as Date) : null,
      countryFrom: this.buySIM.home,
      countryTravelTo: this.buySIM.destination,
      isCompleted: isFreeSim,
      isPaid: isFreeSim,
      totalPrice: this.buySIM.totalPrice,
      paidAt: isFreeSim ? (dateNow('Date') as Date) : null,
      productsVariantId: this.buySIM.products,
      simType: SimTypesEnum[this.buySIM.simType],
      customerId: this.buySIM.customerId,
      isDoorDelivery: this.buySIM.isDoorDelivery?.toLowerCase() === 'yes',
      type: OrderType.Activation,
      flowName: this.buySIM.flowName,
      source: this.buySIM.source,
      planStartDate: this.buySIM.planStartDate,
      accountId: this.buySIM?.account,
      isCollectionPoint: this.buySIM?.isCollectionPoint?.toLowerCase() === 'yes',
    } as Checkout;
  }

  async createCheckout(): Promise<void> {
    const checkout: Checkout = this.getCheckoutPayload();
    const checkoutDocument = await this.simService.createCheckout(checkout);
    this.buySIM.checkoutId = checkoutDocument;
  }

  private async updateCheckout(link: string): Promise<void> {
    const checkout = await this.simService.getCheckoutById(this.buySIM.checkoutId.id);
    await this.simService.updateCheckoutById(checkout, {
      paymentLink: link,
    });
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
    const process = await this.swapPaymentService(this.buySIM.home);

    const currency = CountriesBasedCurrency[this.buySIM.home] || CountriesBasedCurrency.ROW;

    const paymentDetails: CheckoutPayload = {
      amount: this.buySIM.totalPrice as number,
      email: this.buySIM.email,
      productName: this.buySIM.plan as ProductVariantSkuEnum,
      currency: currency,
      customerName: this.buySIM.firstName,
      invoiceId: `${this.buySIM.checkoutId.id}`,
      whatsapp: this.buySIM.whatsappNumber,
    };

    const notes = {
      checkoutId: this.buySIM.checkoutId.id,
      planStartDate: this.buySIM.planStartDate,
      type: ParentWorkflow.Activation,
      simId: null,
      airtime: this.buySIM.airtime,
      validity: this.buySIM.validity,
      plan: this.buySIM.plan,
      serialNumber: this.buySIM.serialNumber,
      device: this.buySIM?.device,
    };

    this.buySIM.link = await process.createCheckout(paymentDetails, notes);
    await this.updateCheckout(this.buySIM.link as string);

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

    await this.queueProcess(SQSTypes.crm, {
      checkoutId: this.buySIM.checkoutId.id as unknown as Checkout,
      flowName: CRMWorkFlow.Buy,
    });
    await this.simService.closeConnection();
  }

  private async queueProcess(queueName: KeyType, notificationData: Partial<BuySimPayload> = {}, templateName?: string): Promise<void> {
    await super.pushToQueue(queueName, {
      templateName,
      ...notificationData,
    });

    // Delay the execution 3 seconds, Otherwise notification receiving order might be changed.
    super.delay(3000);
  }
}
