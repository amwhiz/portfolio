/* eslint-disable @typescript-eslint/no-explicit-any */
import SimService from '@handlers/sim/sim';
import { IDeal, ISim } from './interfaces/buy';
import { Checkout, Sim } from 'src/entities';
import { SimType, SimTypesEnum } from 'src/entities/enums/common';
import { HubspotCRM } from '@aw/crm/crm/aw-hubspot';
import { env } from '@aw/env';
import { CRMProcessor } from '@aw/crm';
import { ConfigurationService } from 'src/configurations/configService';
import { HubspotIds } from 'src/types/configuration';
import { ProductNameEnum } from 'src/entities/enums/product';
import { hubspotFormatDate } from 'src/helpers/dates';
import { SimStatusEnum } from 'src/entities/enums/sim';
import { SourceEnum } from 'src/entities/enums/customer';
import { IActivationBuilder } from './interfaces/builders';
import { CustomObjectService, DealService } from '@aw/crm/interfaces/crmServices';

export class CRMActivation {
  public async buildPayload<T>(builder: IActivationBuilder, payload: T): Promise<void> {
    await builder.setDefaultProperties(payload);
    await builder.updateSim();
    await builder.updateDeal();
    await builder.updateDatabase();
  }
}

export class CRMActivationPayload {
  sim: ISim;
  deal: IDeal;
  checkout: Checkout;
}

export class CRMActivationBuilder implements IActivationBuilder {
  private simService: SimService;
  private crmPayload: CRMActivationPayload;
  private crmClient: CRMProcessor;
  private dealService: DealService;
  private customObjectService: CustomObjectService;
  private configService: ConfigurationService;
  private hubspotObjectIds: HubspotIds;
  private simDocument: Sim;
  private checkoutDocument: Checkout;

  constructor() {
    const provider = new HubspotCRM({
      accessToken: env('hubspotToken'),
    });
    this.simService = new SimService();
    this.crmClient = new CRMProcessor(provider);
    this.dealService = this.crmClient.deal();
    this.customObjectService = this.crmClient.customObject();
    this.configService = ConfigurationService.getInstance();
  }

  private getDealStage(status: SimStatusEnum, checkout: Checkout): { dealstage: string } {
    const dealstage = {
      PreActive: this.hubspotObjectIds.Pipelines.wati.stages.activation as unknown as string,
      Active: this.hubspotObjectIds.Pipelines.wati.stages.activation,
      NotActive: this.hubspotObjectIds.Pipelines.wati.stages.pending,
    };
    if (checkout?.accountId) checkout.source = SourceEnum.portal;

    const sourcesStages = {
      [SourceEnum.Airport as string]: {
        dealstage: dealstage[status] as unknown as string,
      },
      [SourceEnum.Chatbot as string]: {
        dealstage: dealstage[status] as unknown as string,
      },
      [SourceEnum.ECommerce as string]: {
        dealstage: this.hubspotObjectIds?.Pipelines.sim.stages.activated as unknown as string,
      },
      [SourceEnum.Shopify as string]: {
        dealstage: this.hubspotObjectIds?.Pipelines.shopify.stages.closedWon as unknown as string,
      },
      [SourceEnum.portal as string]: {
        dealstage: this.hubspotObjectIds?.Pipelines.sim.stages.activated as unknown as string,
      },
      [SourceEnum.Unknown as string]: {
        dealstage: this.hubspotObjectIds?.Pipelines.wati.stages.activation as unknown as string,
      },
    };

    const stage = sourcesStages[checkout.source];
    return { dealstage: stage?.dealstage };
  }

  async setDefaultProperties(payload: any): Promise<void> {
    await this.simService.ormInit();
    this.checkoutDocument = await this.simService.getCheckoutById(payload?.checkoutId, true);
    this.simDocument = await this.simService.getSimById(payload?.simId);

    const simPlans = await this.simService.getSimPlanBySimId(this.simDocument);

    const plan = simPlans.find((variant) => variant.productId.name === ProductNameEnum.UnlimitedPlans);
    const validity = simPlans.find((variant) => variant.productId.name === ProductNameEnum.SimValidity);

    const simType = this.checkoutDocument.simType === SimTypesEnum.eSIM ? SimType.eSIM : SimType.pSIM;
    this.hubspotObjectIds = (await this.configService.getValue('hubspotIds')) as HubspotIds;

    const pipeLines = this.getDealStage(this.simDocument?.status, this.checkoutDocument);

    const simStatus = {
      [SimStatusEnum.Active]: 'Activation complete',
      [SimStatusEnum.NotActive]: 'Not Activated',
      [SimStatusEnum.PreActive]: 'Pre-Activated',
      [SimStatusEnum.Expired]: 'Expired',
    };

    this.crmPayload = {
      deal: {
        dealstage: pipeLines.dealstage,
        sim_validity_date: hubspotFormatDate(validity.expiryDate),
        plan_expire_date: hubspotFormatDate(plan.expiryDate),
        plan_start_date: hubspotFormatDate(plan.startDate),
        paid_at: hubspotFormatDate(this.checkoutDocument.paidAt),
      },
      sim: {
        sim_status: simStatus[this.simDocument?.status],
        qr_code: this.simDocument?.qrCode,
        smdp_address: this.simDocument?.smtps,
        mobile_number: this.simDocument?.mobileNo,
        serial_number: this.simDocument?.serialNumber,
        activation_code: this.simDocument?.activationCode,
        plan_expire_date: hubspotFormatDate(plan.expiryDate),
        plan_start_date: hubspotFormatDate(plan.startDate),
        type: simType?.toLowerCase(),
        sim_expire_date: hubspotFormatDate(validity?.expiryDate),
      },
      checkout: this.checkoutDocument,
    };
  }

  async updateSim(): Promise<void> {
    await this.customObjectService.update(this.hubspotObjectIds.sim, this.crmPayload.checkout.simId, this.crmPayload.sim);
  }

  async updateDeal(): Promise<void> {
    await this.dealService.update(this.crmPayload.checkout.dealId, this.crmPayload.deal);
  }

  async updateDatabase(): Promise<void> {
    const simHubspotIds: Partial<Sim> = {
      simId: this.checkoutDocument.simId,
      dealId: this.checkoutDocument.dealId,
      contactId: this.checkoutDocument.contactId,
    };

    await this.simService.updateSim(this.simDocument.id, simHubspotIds);
    await this.simService.closeConnection();
  }
}
