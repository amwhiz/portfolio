import { generateInvoiceId } from '@aw/pg/utils/getInvoiceId';
import { Accounts } from 'src/entities';
import { BillingTransactions } from 'src/entities/billingTransaction';
import AccountService from '@handlers/account/account';
import SimService from '@handlers/sim/sim';
import { LoggerService } from '@aw/logger';
import { addDayAndFormat, dateNow, hubspotFormatDate } from 'src/helpers/dates';
import { AppError } from '@libs/api-error';
import { PaymentProcessor } from '@aw/pg';
import { PeachPayment } from '@aw/pg/aw-peach';
import { PaymentProvider } from '@aw/pg/interfaces/paymentProvider';
import { configurationsEnum } from 'src/entities/enums/configuration';
import { Configuration } from 'src/entities/configuration';
import { ConfigurationService } from 'src/configurations/configService';
import { IFormsWebhook, PortalSim } from '../interfaces/sales';
import { CheckoutPayload } from '@aw/pg/types/checkout';
import { ProductVariantSkuEnum } from 'src/entities/enums/productVariant';
import { PaymentTypes } from '@handlers/payments/enums/paymentStatus';
import { WorkflowBase } from '@handlers/webhook-wati/workflows/pushToQueue';
import { SQSTypes } from 'src/constants/sqs';
import { PartnerTermAction } from '@handlers/crm/flowType/enums/partnerTerm';
import { CRMWorkFlow } from 'src/enums/workflows';
import { ZONE } from 'src/entities/enums/account';
import { StripePayment } from '@aw/pg/aw-stripe';
import { RegionBasedCurrency } from '@handlers/portal/constants/regionBasedCurrency';

export class CODService extends WorkflowBase {
  private partnerSimsPayload: IFormsWebhook;
  private account: Accounts;
  private accountService: AccountService;
  private invoiceId: string = generateInvoiceId();
  private paymentLink: string;
  private partnerNotes: string = 'Partner-Terms';
  private totalInvoiceAmount: number = 0;
  private simService: SimService;
  private logger = new LoggerService({ serviceName: CODService.name });
  private configService: ConfigurationService;
  private totalSimCounts: number;
  private billingTransactionDocument: BillingTransactions;
  private paymentLinkExpiryTime: number; //In minutes

  constructor() {
    super();
    this.accountService = new AccountService();
    this.simService = new SimService();
    this.configService = ConfigurationService.getInstance();
  }

  private buildPaymentParams(): CheckoutPayload {
    return {
      amount: this.totalInvoiceAmount,
      invoiceId: this.invoiceId,
      customerName: `${this.account?.name}`,
      email: this.account?.email,
      currency: RegionBasedCurrency[this.account.zone],
      whatsapp: this.account?.whatsapp,
      expiryTime: this.paymentLinkExpiryTime,
      productName: 'Billing Transaction' as ProductVariantSkuEnum,
    };
  }

  private setEvent(event: IFormsWebhook): void {
    this.partnerSimsPayload = event;
    this.totalInvoiceAmount =
      (event?.sims as PortalSim)?.amount ?? (event?.sims as PortalSim[])?.map((sim) => sim?.amount ?? 0)?.reduce((a, b) => a + b, 0);
    this.totalSimCounts = (event?.sims as PortalSim[])?.length ?? 1;
    this.paymentLinkExpiryTime = event?.sims?.['expiryTime'];
  }

  private async refreshToken(token: string): Promise<string> {
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

    const paymentProvider: PaymentProvider = new PeachPayment();
    const paymentProcess = new PaymentProcessor(paymentProvider);

    if (timeDifferenceInHours < 0 || timeDifferenceInHours > 2) {
      const updatedToken: {
        access_token: string;
        expires_in?: number;
      } = await paymentProcess.auth();

      if (!updatedToken?.access_token) throw new AppError('Unable to refresh token, Please try again later');

      const updateConfig = {
        option_name: configurationsEnum['peachToken'],
        option_value: updatedToken['access_token'],
        updatedAt: <Date>dateNow('Date'),
      };
      this.simService.updateConfiguration(configures, updateConfig as Partial<Configuration>);
      return updatedToken?.access_token;
    }

    return token;
  }

  private async peachPaymentLink(notes: { partnerNotes: string; invoiceId: string }, peachData: CheckoutPayload): Promise<string | void> {
    const oldAccessToken = (await this.configService.getValue('peachToken')) as string;
    const peachToken: string = await this.refreshToken(oldAccessToken);

    const paymentProvider: PaymentProvider = new PeachPayment(peachToken);
    const paymentProcess = new PaymentProcessor(paymentProvider);

    if (!peachToken) {
      this.logger.error(`Access token not found : ${peachToken}`);
      return;
    }
    peachData.expiryTime = 1440;
    return await paymentProcess.createCheckout(peachData, notes);
  }

  private async generatePaymentLink(): Promise<string | void> {
    this.logger.info('StartGeneratePaymentLink');

    const internationalZone = this.account.zone === ZONE.International;

    const notes = {
      partnerNotes: this.partnerNotes,
      invoiceId: this.invoiceId,
    };

    const paymentData = this.buildPaymentParams();
    this.logger.info(`PaymentData : ${JSON.stringify(paymentData)}`);

    if (internationalZone) {
      const paymentProvider: PaymentProvider = new StripePayment();
      const paymentProcess = new PaymentProcessor(paymentProvider);
      return await paymentProcess.createCheckout(paymentData, notes);
    }
    return await this.peachPaymentLink(notes, paymentData);
  }

  private buildBillingTransaction(): Partial<BillingTransactions> {
    const today = hubspotFormatDate(<Date>dateNow('Date'));

    return {
      account: this.account,
      amount: this.totalInvoiceAmount,
      weekStartDate: this.partnerSimsPayload.sims?.['startDate'] ?? today,
      weekEndDate: this.partnerSimsPayload.sims?.['endDate'] ?? today,
      paymentLink: this.paymentLink,
      invoice: this.invoiceId,
      paymentDueDate:
        this.account.zone === ZONE.International
          ? <string>addDayAndFormat(<Date>dateNow('Date'), 1, 'date')
          : <string>addDayAndFormat(<Date>dateNow('Date'), 5, 'date'),
      isExpired: false,
      isPaid: false,
      paymentStatus: PaymentTypes.initiated,
      currentPlan: this.account.currentPlan,
      paidAt: null,
      createdAt: <Date>dateNow('Date'),
      updatedAt: <Date>dateNow('Date'),
      totalSims: this.totalSimCounts,
      sims: JSON.stringify(this.partnerSimsPayload),
    };
  }

  private async createBillingTransaction(): Promise<void> {
    const billingTransactionProp = this.buildBillingTransaction();

    this.logger.info(`BillingTransactionParams: ${JSON.stringify(billingTransactionProp)}`);

    const document: BillingTransactions = await this.simService.createBillingTransaction(billingTransactionProp);
    this.logger.info(`Record created successfully. ${document.id}`);
    this.billingTransactionDocument = document;
  }

  private async updateAccount(): Promise<void> {
    await this.accountService.upsertAccount({ ...this.account, lastInvoiceDate: <Date>dateNow('Date') });
  }

  async CodPartnerTerm(accountDocument: Accounts, event: IFormsWebhook): Promise<{ url: string; invoiceId: string }> {
    try {
      this.setEvent(event);
      this.account = accountDocument;
      await this.simService.ormInit();
      await this.accountService.ormInit();
      this.paymentLink = <string>await this.generatePaymentLink();

      await this.createBillingTransaction();
      await this.updateAccount();

      await super.pushToQueue(SQSTypes.crm, {
        invoiceId: this.billingTransactionDocument.invoice,
        action: PartnerTermAction.create,
        status: this.billingTransactionDocument.paymentStatus,
        flowName: CRMWorkFlow.PartnerTerm,
      });

      return { url: this.paymentLink, invoiceId: this.invoiceId };
    } catch (e) {
      return {
        url: null,
        invoiceId: null,
      };
    }
  }

  async billingTransactionStatus(invoiceId: string): Promise<PaymentTypes> {
    await this.simService.ormInit();

    const billingTransactionDocument = await this.simService.getBillingTransactionByInvoiceId(invoiceId);
    return billingTransactionDocument?.paymentStatus;
  }
}
