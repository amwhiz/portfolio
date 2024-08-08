import dayjs from 'dayjs';
import { query } from '@handlers/sim/queries/query';
import { Accounts } from 'src/entities';
import BillingService from '@handlers/portal/accounts/billing/services';
import { LoggerService } from '@aw/logger';
import { hubspotFormatDate } from 'src/helpers/dates';
import { IBilling } from '@handlers/portal/accounts/billing/interfaces/billing';
import { CODService } from './cod';
import { IFormsWebhook } from '../interfaces/sales';
import AccountService from '@handlers/account/account';
import { AgentSale } from '@handlers/portal/accounts/billing/types/billing';
import { env } from '@aw/env';
import { WorkflowBase } from '@handlers/webhook-wati/workflows/pushToQueue';
import { SQSTypes } from 'src/constants/sqs';
import { RegionBasedCurrency } from '@aw/pg/enums/regionCurrency';
import { BillingTransactionInvoice } from '@handlers/payments/interfaces/invoice';
import { ZONE } from 'src/entities/enums/account';

export class CODDowngrade extends WorkflowBase {
  private account: Accounts;
  private billingService: BillingService;
  private logger = new LoggerService({ serviceName: CODDowngrade.name });
  private codService: CODService;
  private accountService: AccountService;

  constructor(account?: Accounts) {
    super();
    this.account = account;
    this.billingService = new BillingService();
    this.accountService = new AccountService();
  }

  buildParams(amount: number, dateRange: IBilling): IFormsWebhook {
    return {
      account: this.account,
      sims: {
        amount: amount,
        email: this.account.email,
        expiryTime: this.account.zone === ZONE.International ? 1440 : 7200,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  queueParams(amount: number, dateRange: IBilling, invoiceData, paymentInfo: { url: string; invoiceId: string }): BillingTransactionInvoice {
    return {
      total_amount: amount,
      start_date: dateRange.startDate,
      end_date: dateRange.endDate,
      invoice: paymentInfo.invoiceId,
      billing: invoiceData,
      receiver: this.account.email,
      agent_name: this.account.name,
      address: this.account.address || '--',
      stage: env('stage'),
      hub_id: this.account.hubspotUserId,
      vat_no: this.account.vatNumber || '--',
      payment_link: paymentInfo.url,
      currency: RegionBasedCurrency[this.account.zone],
      type: 'beforePayment',
    };
  }

  async generatePaymentLink(amount: number, dateRange: IBilling): Promise<{ url: string; invoiceId: string }> {
    const codParams = this.buildParams(amount, dateRange);
    this.logger.info(`CodBuildParams : ${JSON.stringify(codParams)}`);

    this.codService = new CODService();

    return await this.codService.CodPartnerTerm(this.account, codParams);
  }

  //Generate billing for plan downgrade to COD
  async generateBilling(users: Partial<Accounts>[]): Promise<void> {
    await this.accountService.ormInit();

    const dateInterval = {
      startDate: dayjs(this.account.lastInvoiceDate),
      endDate: dayjs(),
    };
    this.logger.info(`DateInterval : ${JSON.stringify(dateInterval)}`);

    const dateRange = {
      startDate: hubspotFormatDate(this.account.lastInvoiceDate),
      endDate: dateInterval.endDate.format('YYYY-MM-DD'),
    };
    let totalAmount: number = 0;
    const partnerSales = [];

    for (const user of users) {
      const parameters = [this.account.id, dateInterval.startDate, dateInterval.endDate];
      const res = await this.accountService.executeQuery<AgentSale[]>(query.getPartnerSimSales, parameters);
      res.forEach((a) => {
        partnerSales.push({
          name: user.name,
          amount: a.soldSimsAmount || 0,
          sim_quantity: a.soldSimsCount || 0,
          date: dayjs(a.date).format('YYYY-MM-DD'),
        });
        totalAmount += a?.soldSimsAmount || 0;
      });
    }

    if (totalAmount === 0) {
      this.logger.info(`No sales have been made within the specified date range`);
      return;
    }
    const paymentInfo = await this.generatePaymentLink(totalAmount, dateRange);
    const invoiceData = this.billingService.groupDataByDate(partnerSales);
    this.logger.info(`Invoice Data : ${JSON.stringify(invoiceData)}`);

    //billing invoice mail
    const queueParams = this.queueParams(totalAmount, dateRange, invoiceData, paymentInfo);
    await super.pushToQueue(SQSTypes.billingInvoice, queueParams);
  }
}
