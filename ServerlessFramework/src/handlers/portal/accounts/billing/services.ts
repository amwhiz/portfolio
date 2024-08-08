import { IBilling } from './interfaces/billing';
import { LoggerService, logger as Logger, logger } from '@aw/logger';
import { Accounts } from 'src/entities/account';
import { BillingTypes } from './enums/billingTypes';
import AccountService from '@handlers/account/account';
import { BillingTransactions } from 'src/entities/billingTransaction';
import { query } from '@handlers/sim/queries/query';
import { PlanType, Role } from 'src/entities/enums/account';
import { getUtcDayEnd, getUtcDayStart, hubspotFormatDate } from 'src/helpers/dates';
import { AuthService } from '@handlers/portal/auth/services';
import { AgentInvoiceResponse, AgentSale, BillingResponse, Invoice } from './types/billing';

export default class BillingService {
  private logger: typeof Logger;
  public payload: IBilling;
  public agentEmail: string;
  private accountService: AccountService;
  private authService: AuthService;

  constructor(req?: IBilling, agentEmail?: string) {
    this.logger = new LoggerService({ serviceName: BillingService.name });
    this.accountService = new AccountService();
    this.authService = new AuthService();
    this.payload = req;
    this.agentEmail = agentEmail;
  }

  private async getPaymentHistory(account: Accounts, userAgents): Promise<BillingTransactions[]> {
    this.logger.info('StartedGetPaymentHistory');

    const startDate = getUtcDayStart(this.payload.startDate);
    const endDate = getUtcDayEnd(this.payload.endDate);

    const parameters =
      account.currentPlan === PlanType.COD ? [[...userAgents.map((obj) => obj.id)], startDate, endDate] : [account.id, startDate, endDate];
    const queryString = account.currentPlan === PlanType.COD ? query.getCodAgentPaymentHistory : query.getAgentPaymentHistory;
    this.logger.info('FinishedGetPaymentHistory');
    return await this.accountService.executeQuery<BillingTransactions[]>(queryString, parameters as (string | number | boolean)[]);
  }

  public groupDataByDate(inputData): Invoice[] {
    const groupedData = {};

    inputData.forEach((entry) => {
      const key = entry.date;

      if (!groupedData[key]) {
        groupedData[key] = {
          date: entry.date,
          total_amount: 0,
          agents: [],
        };
      }

      groupedData[key].total_amount += entry.amount;

      const agentIndex = groupedData[key].agents.findIndex((agent) => agent.name === entry.name);
      if (agentIndex === -1) {
        groupedData[key].agents.push({
          name: entry.name,
          amount: entry.amount,
          count: +entry.sim_quantity,
        });
      } else {
        groupedData[key].agents[agentIndex].amount += entry.amount;
        groupedData[key].agents[agentIndex].count += +entry.sim_quantity;
      }
    });

    // Extracting values from the grouped data
    const result: Invoice[] = Object.values(groupedData);
    return result;
  }

  private async getBillingData(userAgents: Partial<Accounts>[]): Promise<BillingResponse> {
    const billing = [];
    let totalAmount: number = 0;

    const startDate = getUtcDayStart(this.payload.startDate);
    const endDate = getUtcDayEnd(this.payload.endDate);

    this.logger.info(`StartDate : ${startDate}, EndDate : ${endDate}`);

    for (const userAgent of userAgents) {
      const parameters = [userAgent.id, startDate, endDate];

      //sale made by the agent or user-agent datewise
      const res = await this.accountService.executeQuery<AgentSale[]>(query.getPartnerSimSales, parameters);
      res.forEach((a) => {
        billing.push({
          name: userAgent.name,
          amount: a.soldSimsAmount || 0,
          sim_quantity: a.soldSimsCount || 0,
          date: hubspotFormatDate(a.date),
        });
        totalAmount += a?.soldSimsAmount || 0;
      });
    }

    return {
      startDate: this.payload.startDate,
      endDate: this.payload.endDate,
      totalAmount: totalAmount,
      billing: this.groupDataByDate(billing),
    };
  }

  private async getCardsData(account: Accounts): Promise<BillingTransactions[]> {
    return await this.accountService.executeQuery(query.getBillingCardsData, [account.id]);
  }

  public async generateAgentInvoice(): Promise<AgentInvoiceResponse | BillingTransactions[]> {
    await this.accountService.ormInit();
    const account: Accounts = await this.accountService.findAccountByUniqueColumn(this.agentEmail);
    this.logger.info('AgentAccountId', { id: account.id });
    let userAgents = [];

    if (account.role === Role.PARTNER) {
      const agents = (await this.authService.partnerRelationShip(account)).agencies;
      userAgents = agents.flatMap((agent) => [agent, ...agent.userAgents]);
    } else {
      userAgents = (await this.authService.agencyRelationShip(account)).userAgents;
    }
    userAgents.push(account);

    logger.info(`UserAgents : ${JSON.stringify(userAgents)}`);

    if (this.payload.type === BillingTypes.paymentHistory) return await this.getPaymentHistory(account, userAgents);

    logger.info('----StartedAgencyBillingRequest----', { req: this.payload });
    return { payments: await this.getCardsData(account), billings: await this.getBillingData(userAgents) };
  }
}
