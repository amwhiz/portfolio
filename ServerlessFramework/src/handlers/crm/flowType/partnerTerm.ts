/* eslint-disable @typescript-eslint/no-explicit-any */
import { HubspotCRM } from '@aw/crm/crm/aw-hubspot';
import { env } from '@aw/env';
import { CRMProcessor } from '@aw/crm';
import { DealService } from '@aw/crm/interfaces/crmServices';
import { Accounts, BillingTransactions } from 'src/entities';
import { HubspotIds } from 'src/types/configuration';
import { ConfigurationService } from 'src/configurations/configService';
import { IPartnerTermBuilder } from './interfaces/builders';
import { AssociationSpecAssociationCategoryEnum } from '@aw/crm/crm/aw-hubspot/types/responseType';
import { Role } from 'src/entities/enums/account';
import { PartnerTerm } from './interfaces/partnerTerm';
import SimService from '@handlers/sim/sim';
import { PartnerTermAction } from './enums/partnerTerm';
import { dateNow } from 'src/helpers/dates';
import { PaymentStatus, PaymentTypes } from '@handlers/payments/enums/paymentStatus';
import { convertHubspotDate } from 'src/helpers/convertDate';

export class CRMPartnerTerm {
  public async buildPayload<T extends PartnerTerm>(builder: IPartnerTermBuilder, payload: T): Promise<void> {
    await builder.setDefaultProperties(payload);
    await builder.upsertDeal();
    await builder.updateBillingTransaction();
  }
}

export class CRMPartnerTermPayload {
  deal: {
    amount: number;
    dealname: string;
    invoice: string;
    payment_link?: string;
    payment_status: PaymentStatus;
    due_date: string;
    dealstage: number;
    pipeline: number;

    week_start_date: string;
    week_end_date: string;
  };
  hubspotIds: {
    dealId: string;
  };
  billingTransaction: Partial<BillingTransactions>;
  action: PartnerTermAction;
}

export class CRMPartnerTermBuilder implements IPartnerTermBuilder {
  private crmPayload: CRMPartnerTermPayload;
  private crmClient: CRMProcessor;
  private dealService: DealService;
  private configService: ConfigurationService;
  private hubspotObjectIds: HubspotIds;
  private associateType: number;
  private simService: SimService;
  private billingTransactionDocument: Partial<BillingTransactions>;

  constructor() {
    const provider = new HubspotCRM({
      accessToken: env('hubspotToken'),
    });
    this.crmClient = new CRMProcessor(provider);
    this.dealService = this.crmClient.deal();
    this.configService = ConfigurationService.getInstance();
    this.simService = new SimService();
  }

  async setDefaultProperties(payload: PartnerTerm): Promise<void> {
    await this.simService.ormInit();
    this.hubspotObjectIds = (await this.configService.getValue('hubspotIds')) as HubspotIds;

    this.billingTransactionDocument = await this.simService.getBillingTransactionByInvoiceId(payload.invoiceId);
    const status = {
      [PaymentTypes.initiated]: PaymentStatus.initiated,
      [PaymentTypes.expired]: PaymentStatus.expired,
      [PaymentTypes.completed]: PaymentStatus.success,
      [PaymentTypes.processing]: PaymentStatus.pending,
      [PaymentTypes.opened]: PaymentStatus.pending,
      [PaymentTypes.cancelled]: PaymentStatus.expired,
    };

    this.crmPayload = {
      deal: {
        amount: this.billingTransactionDocument.amount,
        dealname: payload.invoiceId,
        invoice: payload.invoiceId,
        payment_link: this.billingTransactionDocument.paymentLink,
        payment_status: status[payload?.status],
        pipeline: this.hubspotObjectIds.Pipelines.billing.id,
        dealstage: this.hubspotObjectIds.Pipelines.billing.stages.open,
        due_date: convertHubspotDate(this.billingTransactionDocument.paymentDueDate),
        week_start_date: convertHubspotDate(this.billingTransactionDocument.weekStartDate),
        week_end_date: convertHubspotDate(this.billingTransactionDocument.weekEndDate),
      },
      hubspotIds: {
        dealId: this.billingTransactionDocument.dealId,
      },
      action: payload?.action,
      billingTransaction: {
        paymentStatus: payload?.status,
        dealId: this.billingTransactionDocument.dealId,
      },
    };
  }

  private async createDeal(): Promise<string> {
    const account: Accounts = this.billingTransactionDocument.account;

    const associationObjectTypeId = {
      [Role.AGENCY as string]: this.hubspotObjectIds.Deal_to_Agency,
      [Role.USER_AGENT as string]: this.hubspotObjectIds.Deal_to_UserAgent,
    };

    this.associateType = associationObjectTypeId[account.role];

    const deal = await this.dealService.create(this.crmPayload.deal, [
      {
        to: {
          id: this.billingTransactionDocument.account?.hubspotUserId,
        },
        types: [
          {
            associationCategory: AssociationSpecAssociationCategoryEnum['UserDefined'],
            associationTypeId: this.associateType,
          },
        ],
      },
    ]);

    return deal?.['id'];
  }

  private getDealStage(): number {
    const stage = {
      [PaymentStatus.expired]: this.hubspotObjectIds.Pipelines.billing.stages.expired,
      [PaymentStatus.success]: this.hubspotObjectIds.Pipelines.billing.stages.completed,
    };

    return stage[this.crmPayload.deal.payment_status];
  }

  private async updateDeal(): Promise<void> {
    const updateDeal = {
      pipeline: this.hubspotObjectIds.Pipelines.billing.id,
      dealstage: this.getDealStage(),
      payment_status: this.crmPayload.deal.payment_status,
    };
    await this.dealService.update(this.billingTransactionDocument.dealId, updateDeal);
  }

  async upsertDeal(): Promise<void> {
    if (this.crmPayload.action === PartnerTermAction.create) {
      this.crmPayload.billingTransaction.dealId = await this.createDeal();
      return;
    }
    if (this.billingTransactionDocument.dealId) await this.updateDeal();
  }

  async updateBillingTransaction(): Promise<void> {
    if (this.crmPayload.deal.payment_status === PaymentStatus.success) {
      this.crmPayload.billingTransaction.paidAt = <Date>dateNow('Date');
      this.crmPayload.billingTransaction.isPaid = true;
    } else if (this.crmPayload.deal.payment_status === PaymentStatus.expired) {
      this.crmPayload.billingTransaction.isExpired = true;
    }

    await this.simService.createBillingTransaction({ ...this.billingTransactionDocument, ...this.crmPayload.billingTransaction });
  }
}
