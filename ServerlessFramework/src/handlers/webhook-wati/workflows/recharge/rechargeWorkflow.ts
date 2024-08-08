import { IRechargeBuilder } from './interfaces/rechargeBuilder';
import { WorkflowBase } from '../pushToQueue';
import { KeyType } from '@aw/env';
import { Sim, SimPlan, SimActivity, Customer, Checkout } from 'src/entities';
import { SimType, SimTypesEnum } from 'src/entities/enums/common';
import { dateNow, findAndConvertDate, getTime } from 'src/helpers/dates';
import { PaymentProcessor } from '@aw/pg';
import { PaymentProvider } from '@aw/pg/interfaces/paymentProvider';
import { CheckoutPayload } from '@aw/pg/types/checkout';
import { SQSTypes } from 'src/constants/sqs';
import { ProductVariantCurrencyEnum, ProductVariantSkuEnum } from 'src/entities/enums/productVariant';
import { SimStatusEnum } from 'src/entities/enums/sim';
import { Actions } from 'src/enums/actions';
import { CRMWorkFlow, ParentWorkflow } from 'src/enums/workflows';
import SimService from '@handlers/sim/sim';
import ValidatorBase from '@handlers/validator/validator';
import { ValidationRequestType } from '@handlers/validator/types/validator';
import { AppError } from '@libs/api-error';
import { Templates } from 'src/constants/templates';
import { removePaymentLinkDomain } from 'src/helpers/removeDomain';
import { CurrencySymbol } from '@aw/pg/enums/regionCurrency';
import { PeachPayment } from '@aw/pg/aw-peach';
import { configurationsEnum } from 'src/entities/enums/configuration';
import { LoggerService } from '@aw/logger';
import { Configuration } from 'src/entities/configuration';
import { ConfigurationService } from 'src/configurations/configService';
import { ProductNameEnum } from 'src/entities/enums/product';
import { OrderType } from 'src/entities/enums/order';
import { SourceEnum } from 'src/entities/enums/customer';
import { StripePayment } from '@aw/pg/aw-stripe';
import { Countries, CountriesBasedCurrency } from 'src/constants/countries';
import { RegionBasedCurrency, currencyBasedHome } from '@handlers/portal/constants/regionBasedCurrency';

export class RechargeSim {
  public async buildPayload<T>(builder: IRechargeBuilder, payload: T): Promise<void> {
    await builder.setDefaultProperties(payload);
    await builder.checkSimActive();
    await builder.setProducts();
    await builder.createCheckout();
    await builder.generatePaymentLink();
  }
}

export class RechargePayload {
  email?: string;
  products?: number[];
  totalPrice?: number = 0;
  airtime?: string;
  validity?: string;
  simId?: Sim;
  simSerial?: string;
  simPlan?: SimPlan;
  simActivityId?: SimActivity;
  customerId?: Customer;
  simType?: SimType;
  deviceType?: string;
  whatsappNumber?: string;
  planStartDate?: string;
  plan?: string;
  link?: string | void;
  airtimeAmount?: number;
  simValidityAmount?: number;
  planAmount?: number;
  mobileNo?: string;
  checkoutId?: Checkout;
  selectedOption?: string | 'yes';
  home?: string;
  latestSimValidity?: SimPlan;
}

export class RechargeBuilder extends WorkflowBase implements IRechargeBuilder {
  private recharge: RechargePayload = {};
  private simService: SimService;
  private configService: ConfigurationService;
  private logger = new LoggerService({ serviceName: RechargeBuilder.name });

  constructor() {
    super();
    this.configService = ConfigurationService.getInstance();
    this.simService = new SimService();
  }

  async setDefaultProperties(payload: RechargePayload): Promise<void> {
    await this.simService.ormInit();

    payload['selectedOption'] = `${payload?.selectedOption}`.toLowerCase() === 'yes' ? '1' : payload?.selectedOption;

    const customer = await this.simService.getCustomerByEmail(payload?.email);
    const validator = new ValidatorBase(payload as ValidationRequestType);
    await validator.ormInit();
    const simNumbers = await validator.getSimNumberByCustomer(customer);
    const selectedSim = simNumbers[+payload?.selectedOption - 1];

    // Latest sim validity
    const latestSimValidity = (await this.simService.getSimPlanBySimId(selectedSim)).find(
      (variant) => variant.productId.name === ProductNameEnum.SimValidity
    );

    this.recharge = {
      email: payload?.email,
      whatsappNumber: payload?.whatsappNumber,
      airtime: payload?.airtime,
      validity: payload.validity,
      plan: payload?.plan,
      customerId: customer,
      simId: selectedSim,
      mobileNo: selectedSim.mobileNo,
      planStartDate: payload?.planStartDate,
      latestSimValidity: latestSimValidity,
      home: selectedSim?.countryFrom,
    };
  }

  async checkSimActive(): Promise<void> {
    const sim = await this.simService.getSimByMobileNumber(this.recharge.mobileNo);
    const validityPlan = this.recharge.latestSimValidity;
    const simPlan = await this.simService.getSimPlan(sim, validityPlan.productId, validityPlan?.productVariantId);

    if (this.recharge.planStartDate) {
      const isSimValid = getTime(findAndConvertDate(this.recharge.planStartDate)) <= getTime(simPlan.expiryDate); // get simPlan sim expired
      if (!isSimValid) {
        await this.queueProcess(
          SQSTypes.notification,
          {
            action: Actions.Wati,
            whatsappNumber: this.recharge.whatsappNumber,
          },
          Templates.simValidPeriodExtend
        );

        throw new AppError('simValidPeriodExtend', 200);
      }
    }

    if (sim.status !== SimStatusEnum.Active) {
      await this.queueProcess(
        SQSTypes.notification,
        {
          action: Actions.Wati,
          whatsappNumber: this.recharge.whatsappNumber,
        },
        Templates.simExpired
      );
      throw new AppError('simExpired', 200);
    }
    this.recharge['simId'] = sim;
  }

  async setProducts(): Promise<void> {
    const productVariants: string[] = [this.recharge.plan, this.recharge.airtime, this.recharge.validity].filter((notNull) => notNull);

    const products = await this.simService.getProductVariantsBySku(productVariants as ProductVariantSkuEnum[]);

    this.recharge = {
      ...(this?.recharge || {}),
      airtimeAmount: products.find((product) => product.sku === this.recharge.airtime)?.price,
      simValidityAmount: products.find((product) => product.sku === this.recharge.validity)?.price,
      planAmount: products.find((product) => product.sku === this.recharge.plan)?.price,
    };

    this.recharge['products'] = products.map((variants) => variants.id);
    this.recharge['totalPrice'] = products.map((variants) => variants.price).reduce((a, b) => a + b, 0);
  }

  getCheckoutPayload(): Checkout {
    return {
      countryFrom: null,
      countryTravelTo: null,
      isCompleted: false,
      isPaid: false,
      totalPrice: this.recharge.totalPrice,
      productsVariantId: this.recharge.products,
      simType: this.recharge.simId.simType === SimTypesEnum.eSIM ? SimTypesEnum.eSIM : SimTypesEnum.pSIM,
      customerId: this.recharge.customerId,
      paymentLink: this.recharge.link,
      type: OrderType.Recharge,
      source: SourceEnum.Chatbot,
      flowName: OrderType.Recharge,
      planStartDate: this.recharge?.planStartDate,
    } as Checkout;
  }

  async createCheckout(): Promise<void> {
    const checkout: Checkout = this.getCheckoutPayload();
    const checkoutDocument = await this.simService.createCheckout(checkout);
    this.recharge['checkoutId'] = checkoutDocument;
  }

  private async updateCheckout(link: string): Promise<void> {
    const checkout = await this.simService.getCheckoutById(this.recharge.checkoutId.id);
    await this.simService.updateCheckoutById(checkout, {
      paymentLink: link,
    });
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
    const currency =
      RegionBasedCurrency[this.recharge?.customerId?.accountId?.zone] || CountriesBasedCurrency[this.recharge.home] || CountriesBasedCurrency.ROW;
    const process = await this.swapPaymentService(currencyBasedHome[currency]);

    const paymentDetails: CheckoutPayload = {
      amount: this.recharge.totalPrice,
      email: this.recharge.email,
      productName: (this.recharge.plan || this.recharge.airtime || this.recharge.validity) as ProductVariantSkuEnum,
      currency,
      customerName: this.recharge.customerId.firstName,
      invoiceId: `${this.recharge.checkoutId.id}`,
      whatsapp: this.recharge.checkoutId.customerId.whatsapp,
    };

    const notes = {
      checkoutId: this.recharge.checkoutId.id,
      planStartDate: this.recharge.planStartDate,
      type: ParentWorkflow.Recharge,
      simId: this.recharge.simId.id,
      airtime: this.recharge.airtime,
      validity: this.recharge.validity,
      plan: this.recharge.plan,
    };

    this.recharge['link'] = await process.createCheckout(paymentDetails, notes);
    if (!this.recharge.link) throw new AppError('Unable to generate payment link', 400);
    await this.updateCheckout(this.recharge.link);
    const templateName = currency === ProductVariantCurrencyEnum.USD ? Templates.sendStripePaymentLink : Templates.sendPeachPaymentLink;
    await this.queueProcess(
      SQSTypes.notification,
      {
        totalPrice: `${CurrencySymbol[currency]}${this.recharge.totalPrice}`,
        email: this.recharge.email,
        link: removePaymentLinkDomain(this.recharge.link),
        action: Actions.Wati,
        whatsappNumber: this.recharge.whatsappNumber,
      },
      templateName
    );

    await this.queueProcess(SQSTypes.crm, {
      checkoutId: this.recharge.checkoutId.id as unknown as Checkout,
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
