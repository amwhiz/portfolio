/* eslint-disable @typescript-eslint/no-explicit-any */
import { HubspotCRM } from '@aw/crm/crm/aw-hubspot';
import { env } from '@aw/env';
import { CRMProcessor } from '@aw/crm';
import { DealService } from '@aw/crm/interfaces/crmServices';
import { Accounts, SimPurchase } from 'src/entities';
import { HubspotIds } from 'src/types/configuration';
import { ConfigurationService } from 'src/configurations/configService';
import { hubspotFormatDate } from 'src/helpers/dates';
import { ISimPurchaseBuilder } from './interfaces/builders';
import { AssociationSpecAssociationCategoryEnum } from '@aw/crm/crm/aw-hubspot/types/responseType';
import { SimPurchaseStatus } from 'src/entities/enums/simPurchase';
import { Role } from 'src/entities/enums/account';

export class CRMSimPurchase {
  public async buildPayload<T>(builder: ISimPurchaseBuilder, payload: T): Promise<void> {
    await builder.setDefaultProperties(payload);
    await builder.createDeal();
  }
}

export class CRMSimPurchasePayload {
  deal: {
    order_date: string;
    dealname: string;
    psim_quantity: string;
    order_status: string;
    pipeline: number;
    dealstage: number;
  };
  hubspotIds: {
    accountId: string;
  };
}

export class CRMSimPurchaseBuilder implements ISimPurchaseBuilder {
  private crmPayload: CRMSimPurchasePayload;
  private crmClient: CRMProcessor;
  private dealService: DealService;
  private configService: ConfigurationService;
  private hubspotObjectIds: HubspotIds;
  private associateType: number;

  constructor() {
    const provider = new HubspotCRM({
      accessToken: env('hubspotToken'),
    });
    this.crmClient = new CRMProcessor(provider);
    this.dealService = this.crmClient.deal();
    this.configService = ConfigurationService.getInstance();
  }

  async setDefaultProperties(payload: any): Promise<void> {
    this.hubspotObjectIds = (await this.configService.getValue('hubspotIds')) as HubspotIds;

    const order: SimPurchase = payload.simPurchaseDocument;
    const account: Accounts = payload.account;

    const associationObjectTypeId = {
      [Role.AGENCY as string]: this.hubspotObjectIds.Deal_to_Agency,
      [Role.USER_AGENT as string]: this.hubspotObjectIds.Deal_to_UserAgent,
    };

    this.associateType = associationObjectTypeId[account.role];
    this.crmPayload = {
      deal: {
        dealname: account?.name,
        psim_quantity: order?.quantity?.toString() ?? '0',
        order_date: hubspotFormatDate(order.purchasedAt),
        order_status: order.status === SimPurchaseStatus.dispatched ? 'Complete' : 'Open',
        pipeline: this.hubspotObjectIds.Pipelines.order.id,
        dealstage: this.hubspotObjectIds.Pipelines.order.stages.orderPlaced,
      },
      hubspotIds: {
        accountId: account?.hubspotUserId,
      },
    };
  }

  async createDeal(): Promise<void> {
    await this.dealService.create(this.crmPayload.deal, [
      {
        to: {
          id: this.crmPayload.hubspotIds.accountId,
        },
        types: [
          {
            associationCategory: AssociationSpecAssociationCategoryEnum['UserDefined'],
            associationTypeId: this.associateType,
          },
        ],
      },
    ]);
  }
}
