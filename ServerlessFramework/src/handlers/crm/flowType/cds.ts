/* eslint-disable require-await */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HubspotCRM } from '@aw/crm/crm/aw-hubspot';
import { env } from '@aw/env';
import { CRMProcessor } from '@aw/crm';
import { DealService, ContactService } from '@aw/crm/interfaces/crmServices';
import { SimResponse } from './interfaces/crmResponse';
import { Sim } from 'src/entities';
import { ICdsBuilder } from './interfaces/builders';

export class CRMCds {
  public async buildPayload<T>(builder: ICdsBuilder, payload: T): Promise<void> {
    await builder.setDefaultProperties(payload);
    await builder.updateDeal();
    await builder.updateSim();
  }
}

export class CRMCdsPayload {
  deal: {
    mcc_country: string;
    location_updated_date: string;
  };
  hubspotIds: {
    contactId: string;
    dealId: string;
  };
  contact: {
    mcc_country: string;
    location_updated_date: string;
  };
  simId: string;
}

export class CRMCdsBuilder implements ICdsBuilder {
  private crmPayload: CRMCdsPayload;
  private crmClient: CRMProcessor;
  private dealService: DealService;
  private contactService: ContactService;

  constructor() {
    const provider = new HubspotCRM({
      accessToken: env('hubspotToken'),
    });
    this.crmClient = new CRMProcessor(provider);
    this.dealService = this.crmClient.deal();
    this.contactService = this.crmClient.contact();
  }

  async setDefaultProperties(payload: any): Promise<void> {
    this.crmPayload = {
      deal: {
        location_updated_date: payload?.locationUpdatedDate,
        mcc_country: payload?.mccCountry,
      },
      hubspotIds: {
        contactId: (payload?.simId as Sim)?.contactId,
        dealId: (payload?.simId as Sim)?.dealId,
      },
      contact: {
        location_updated_date: payload?.locationUpdatedDate,
        mcc_country: payload?.mccCountry,
      },
      simId: payload?.simId,
    };
  }

  async updateDeal(): Promise<void> {
    await this.dealService.update(this.crmPayload.hubspotIds.dealId, this.crmPayload.deal);
  }

  async updateSim(): Promise<void> {
    (await this.contactService.update(this.crmPayload.hubspotIds.contactId, this.crmPayload.contact)) as SimResponse;
  }
}
