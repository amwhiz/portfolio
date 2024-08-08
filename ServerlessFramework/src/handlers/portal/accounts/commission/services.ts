import { Accounts, Commissions } from 'src/entities';
import AccountService from '@handlers/account/account';
import { WorkflowBase } from '@handlers/webhook-wati/workflows/pushToQueue';
import {
  AgencyCommission,
  CommissionServiceBuilder,
  CommissionSims,
  ModifiedCommissionsByDate,
  FetchCommission,
  UserAgentCommission,
} from './interfaces/comission';
import { CommissionRequest } from './interfaces/commissionRequest';
import SimService from '@handlers/sim/sim';
import { Role } from 'src/entities/enums/account';
import { dateNow, getUtcDayEnd, hubspotFormatDate, subtractDayAndFormat } from 'src/helpers/dates';
import { groupBy } from 'lodash';
import { OrderType } from 'src/entities/enums/order';
import { SourceEnum } from 'src/entities/enums/customer';
import { ProductVariantSkuEnum } from 'src/entities/enums/productVariant';

export class CommissionServicesBuilder {
  public async buildPayload(builder: CommissionServiceBuilder, payload: CommissionRequest): Promise<FetchCommission[]> {
    await builder.setDefaultProperties(payload);
    await builder.findAccountRelationShips();
    await builder.getCommissionsByAccounts();
    builder.groupByCreatedAt();
    await builder.groupByAgency();
    return builder.getCommissions();
  }
}

export class CommissionServicePayload {
  parentAccount?: Accounts;
  isAgency: boolean = false;
  partnerAccount?: Accounts;
  agencyAccounts?: Accounts[];
  commissions?: Commissions[];
  modifiedCommissionsByDate?: ModifiedCommissionsByDate[];
  processedCommissionData?: FetchCommission[];
}

export class CommissionService extends WorkflowBase implements CommissionServiceBuilder {
  private commissionPayload: CommissionRequest & CommissionServicePayload;
  private accountService: AccountService; // Declare accountService in CommissionService
  private simService: SimService;

  constructor() {
    super();
    this.accountService = new AccountService(); // Initialize accountService
    this.simService = new SimService();
  }

  async setDefaultProperties(payload: CommissionRequest): Promise<void> {
    await this.accountService.ormInit();
    await this.simService.ormInit();

    const parentAccount = await this.accountService.findAccountByUniqueColumn(payload?.email);

    this.commissionPayload = {
      isAgency: parentAccount?.role === Role.AGENCY,
      email: payload?.email,
      endDate: payload?.endDate,
      startDate: payload?.startDate,
      parentAccount: parentAccount,
    };
  }

  async findAccountRelationShips(): Promise<void> {
    if (!this.commissionPayload?.isAgency) {
      this.commissionPayload.partnerAccount = this.commissionPayload?.parentAccount;
      const relationships = await this.accountService.findRelationShipAccountsByParentAccounts(this.commissionPayload?.partnerAccount);
      this.commissionPayload.agencyAccounts = relationships.map((relationship) => relationship.childAccountId);
    } else {
      this.commissionPayload.agencyAccounts = [this.commissionPayload?.parentAccount];
    }
  }

  async getCommissionsByAccounts(): Promise<void> {
    const accountIds = this.commissionPayload.agencyAccounts?.map((agency) => agency.id);
    this.commissionPayload.commissions = await this.simService.getCommissionByAccountIds(
      accountIds,
      getUtcDayEnd(this.commissionPayload?.endDate ?? <string>dateNow('Date')),
      getUtcDayEnd(this.commissionPayload?.startDate ?? <string>subtractDayAndFormat(dateNow('Date'), 7, 'date'))
    );
  }

  groupByCreatedAt(): void {
    const commissionsByDate: { [k: string]: Commissions[] } = groupBy(this.commissionPayload?.commissions, (commission) =>
      hubspotFormatDate(commission?.createdAt)
    );
    this.commissionPayload.modifiedCommissionsByDate = Object.keys(commissionsByDate).map((date) => ({ date, data: commissionsByDate[date] }));
  }

  private async buildSims(commissionSim: Commissions[]): Promise<CommissionSims[]> {
    const CommissionSims = [];
    for (let i = 0; i < commissionSim?.length; i++) {
      const lineItems = await this.simService.getLineItemByOrderId(commissionSim[i].orderId);
      CommissionSims.push({
        agencyCommission: commissionSim[i].agencyCommissionAmount,
        amount: commissionSim[i].amount,
        customerName: `${commissionSim[i].orderId?.customerId?.firstName ?? ''} ${commissionSim[i].orderId?.customerId?.lastName ?? ''}`,
        partnerCommission: commissionSim[i].partnerCommissionAmount,
        isUpgrade: commissionSim[i].orderId.type === OrderType.Recharge,
        isReferral: commissionSim[i].orderId.source === SourceEnum.Chatbot && !!commissionSim[i].orderId?.accountId?.id,
        isFreeSim: !!lineItems.find((a) => a.productVariantId.sku === ProductVariantSkuEnum['1GbFreeOffer'])?.id,
      });
    }
    return CommissionSims;
  }

  private async groupUserAgent(userAgentCommission: Commissions[]): Promise<UserAgentCommission[]> {
    const userAgentGroups = groupBy(userAgentCommission, (userAgent) => userAgent?.orderId?.accountId?.id);
    const userAgentGroupIds = Object.keys(userAgentGroups);
    const userAgent: UserAgentCommission[] = [];
    for (let userAgentIndex = 0; userAgentIndex < userAgentGroupIds?.length; userAgentIndex++) {
      const userAgentBuildedCommissionSims = await this.reduceGroupUserAgentCommission(userAgentGroups[userAgentGroupIds[userAgentIndex]]);
      userAgent.push(userAgentBuildedCommissionSims);
    }
    return userAgent;
  }

  // Convert the array of single user agent commission into the sims. And userAgent single object.
  private async reduceGroupUserAgentCommission(groupUserAgent: Commissions[]): Promise<UserAgentCommission> {
    const userAgent: UserAgentCommission = {
      id: groupUserAgent[0].orderId.accountId?.id,
      name: groupUserAgent[0].orderId.accountId?.name,
      sims: await this.buildSims(groupUserAgent),
    };
    return userAgent;
  }

  // Convert the array of single agency commission into the sims. And agency single object.
  private async reduceGroupAgencyCommission(groupAgency: Commissions[]): Promise<AgencyCommission> {
    const agency: AgencyCommission = {
      id: groupAgency[0].agencyId.id,
      name: groupAgency[0].agencyId.name,
    };

    const agencySim = groupAgency.filter((commission) => commission.orderId?.accountId?.role === Role.AGENCY);
    const agencyBuildedCommissionSims = await this.buildSims(agencySim);

    const userAgent = groupAgency.filter((commission) => commission.orderId?.accountId?.role === Role.USER_AGENT);
    const groupUserAgent = await this.groupUserAgent(userAgent);

    agency.sims = agencyBuildedCommissionSims;
    agency.userAgent = groupUserAgent;
    return agency;
  }

  async groupByAgency(): Promise<void> {
    const dateModificationLength = this.commissionPayload.modifiedCommissionsByDate?.length;
    const finalCommission: FetchCommission[] = [];
    for (let dateDataIndex = 0; dateDataIndex < dateModificationLength; dateDataIndex++) {
      const agenciesData = this.commissionPayload.modifiedCommissionsByDate[dateDataIndex]?.data;
      const agenciesGroup = groupBy(agenciesData, (agencies) => agencies?.agencyId?.id);
      const agenciesGroupIds = Object.keys(agenciesGroup);
      const agencies: AgencyCommission[] = [];
      for (let agenciesIndex = 0; agenciesIndex < agenciesGroupIds?.length; agenciesIndex++) {
        const buildedSim = await this.reduceGroupAgencyCommission(agenciesGroup[agenciesGroupIds[agenciesIndex]]);
        agencies.push(buildedSim);
      }
      const finalizedCommissionData: FetchCommission = {
        date: this.commissionPayload.modifiedCommissionsByDate[dateDataIndex].date,
        data: {
          agency: agencies,
        },
      };
      finalCommission.push(finalizedCommissionData);
    }
    this.commissionPayload.processedCommissionData = finalCommission;
  }

  getCommissions(): FetchCommission[] {
    return this.commissionPayload.processedCommissionData;
  }
}
