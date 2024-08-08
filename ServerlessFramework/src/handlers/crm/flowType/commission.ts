/* eslint-disable require-await */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HubspotCRM } from '@aw/crm/crm/aw-hubspot';
import { env } from '@aw/env';
import { CRMProcessor } from '@aw/crm';
import { DealService } from '@aw/crm/interfaces/crmServices';
import { ICommissionBuilder } from './interfaces/builders';
import { CommissionRequest } from '@handlers/portal/commission/interfaces/commissionRequest';
import { CommissionPayload } from '@handlers/portal/commission/service';
import SimService from '@handlers/sim/sim';

export class CRMCommission {
  public async buildPayload<T>(builder: ICommissionBuilder, payload: T): Promise<void> {
    await builder.setDefaultProperties(payload);
    await builder.updateDeal();
  }
}

export class CRMCommissionPayload {
  deal: {
    partner_commission_amount: number;
    agency_commission_amount: number;
    airtime_commission_amount: number;
    plan_commission_amount: number;
    validity_commission_amount: number;
  };
  hubspotIds: {
    dealId: string;
  };
}

export class CRMCommissionBuilder implements ICommissionBuilder {
  private crmPayload: CRMCommissionPayload;
  private crmClient: CRMProcessor;
  private dealService: DealService;
  private simService: SimService;

  constructor() {
    const provider = new HubspotCRM({
      accessToken: env('hubspotToken'),
    });
    this.crmClient = new CRMProcessor(provider);
    this.dealService = this.crmClient.deal();
    this.simService = new SimService();
  }

  async setDefaultProperties(payload: CommissionRequest & CommissionPayload): Promise<void> {
    await this.simService.ormInit();

    const checkoutDoc = await this.simService.getCheckoutById(payload?.checkoutId?.id);

    this.crmPayload = {
      deal: {
        agency_commission_amount: payload?.agencyCommissionAmount as unknown as number,
        partner_commission_amount: payload?.partnerCommissionAmount as unknown as number,
        airtime_commission_amount: payload?.airtimeAmount,
        plan_commission_amount: payload?.planAmount,
        validity_commission_amount: payload?.validityAmount,
      },
      hubspotIds: {
        dealId: checkoutDoc?.dealId,
      },
    };
  }

  async updateDeal(): Promise<void> {
    await this.dealService.update(this.crmPayload.hubspotIds.dealId, this.crmPayload.deal);
  }
}
