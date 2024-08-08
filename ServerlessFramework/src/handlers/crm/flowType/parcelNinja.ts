/* eslint-disable @typescript-eslint/no-explicit-any */
import { HubspotCRM } from '@aw/crm/crm/aw-hubspot';
import { env } from '@aw/env';
import { CRMProcessor } from '@aw/crm';
import { DealService } from '@aw/crm/interfaces/crmServices';
import { Checkout } from 'src/entities';
import { HubspotIds } from 'src/types/configuration';
import { ConfigurationService } from 'src/configurations/configService';
import { dateNow, hubspotFormatDate } from 'src/helpers/dates';
import { IParcelNinjaBuilder } from './interfaces/builders';

export class CRMParcelNinja {
  public async buildPayload<T>(builder: IParcelNinjaBuilder, payload: T): Promise<void> {
    await builder.setDefaultProperties(payload);
    await builder.updateDeal();
  }
}

export class CRMParcelNinjaPayload {
  deal: {
    dealstage: string;
    order_number: string;
    order_date: string;
  };
  hubspotIds: {
    dealId: string;
  };
}

export class CRMParcelNinjaBuilder implements IParcelNinjaBuilder {
  private crmPayload: CRMParcelNinjaPayload;
  private crmClient: CRMProcessor;
  private dealService: DealService;
  private configService: ConfigurationService;
  private hubspotObjectIds: HubspotIds;

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

    this.crmPayload = {
      deal: {
        dealstage: this.hubspotObjectIds.Pipelines.wati.stages.parcel as unknown as string,
        order_date: hubspotFormatDate(dateNow('Date')),
        order_number: payload?.outBoundOrderId,
      },
      hubspotIds: {
        dealId: (payload?.checkoutId as Checkout)?.dealId,
      },
    };
    if ((payload?.checkoutId as Checkout)?.accountId) {
      this.crmPayload.deal.dealstage = this.hubspotObjectIds.Pipelines.sim.stages.parcel as unknown as string;
    }
  }

  async updateDeal(): Promise<void> {
    await this.dealService.update(this.crmPayload.hubspotIds.dealId, this.crmPayload.deal);
  }
}
