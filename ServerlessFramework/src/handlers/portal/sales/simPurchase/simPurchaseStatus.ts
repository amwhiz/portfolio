/* eslint-disable @typescript-eslint/no-explicit-any */
import AccountService from '@handlers/account/account';
import { WorkflowBase } from '@handlers/webhook-wati/workflows/pushToQueue';
import { SQSTypes } from 'src/constants/sqs';
import { SimPurchase } from 'src/entities';
import { IWebhook } from '@handlers/portal/auth/interfaces/webhook';
import { SimPurchaseStatus } from 'src/entities/enums/simPurchase';
import { dateNow } from 'src/helpers/dates';
import { AppError } from '@libs/api-error';
import { ResponseStatus } from '@handlers/validator/enum/response';
import { StatusCodes } from 'http-status-codes';
import { CRMWorkFlow } from 'src/enums/workflows';

export default class SimPurchaseService extends WorkflowBase {
  private accountService: AccountService;

  constructor() {
    super();
    this.accountService = new AccountService();
  }

  async queue(event: IWebhook): Promise<void> {
    const simPurchase: Partial<SimPurchase> = {
      dealId: event.objectId?.toString(),
      status: event.properties?.dealstage?.value as SimPurchaseStatus,
      statusUpdatedAt: <Date>dateNow('Date'),
    };
    if (simPurchase?.dealId) await super.pushToQueue(SQSTypes.simPurchase, simPurchase);
  }

  async simPurchaseStatusUpdate(event: Partial<SimPurchase>): Promise<void> {
    await this.accountService.ormInit();

    const simPurchaseDocument = await this.accountService.getSimPurchase(event);
    await this.accountService.updateSimPurchase(simPurchaseDocument, { ...event });
  }

  async getSimPurchase(email: string, query: { limit: string; page: string }): Promise<{ total: number; order: Partial<SimPurchase>[] }> {
    await this.accountService.ormInit();
    const limit = Number(query?.limit || '50');
    const page = Number(query?.page || '1') - 1;

    const isAccountExists = await this.accountService.findAccountByUniqueColumn(email);
    if (!isAccountExists?.email) throw new AppError(ResponseStatus.NotFound, StatusCodes.NOT_FOUND);

    const simPurchase: Partial<SimPurchase>[] = await this.accountService.getSimPurchaseByAccount(isAccountExists, limit, page);
    return { total: simPurchase?.length, order: simPurchase };
  }

  async simPurchase(email: string, simPurchase: Partial<SimPurchase>): Promise<Partial<SimPurchase>> {
    await this.accountService.ormInit();

    const isAccountExists = await this.accountService.findAccountByUniqueColumn(email);
    if (!isAccountExists?.email) throw new AppError(ResponseStatus.NotFound, StatusCodes.NOT_FOUND);

    const simPurchaseProp: Partial<SimPurchase> = {
      accountId: isAccountExists,
      purchasedAt: <Date>dateNow('Date'),
      status: SimPurchaseStatus.orderPlaced,
      statusUpdatedAt: <Date>dateNow('Date'),
      quantity: simPurchase.quantity,
    };

    const simPurchaseDocument: Partial<SimPurchase> = await this.accountService.createSimPurchase(simPurchaseProp);
    await super.pushToQueue(SQSTypes.crm, {
      simPurchaseDocument,
      account: isAccountExists,
      flowName: CRMWorkFlow.SimPurchase,
    });
    return simPurchaseDocument;
  }
}
