/* eslint-disable @typescript-eslint/no-explicit-any */
import SimService from '@handlers/sim/sim';
import { IDeal, ISim } from './interfaces/buy';
import { Checkout, Sim } from 'src/entities';
import { HubspotCRM } from '@aw/crm/crm/aw-hubspot';
import { env } from '@aw/env';
import { CRMProcessor } from '@aw/crm';
import { ConfigurationService } from 'src/configurations/configService';
import { HubspotIds } from 'src/types/configuration';
import { CustomObjectService, DealService } from '@aw/crm/interfaces/crmServices';
import { ProductNameEnum } from 'src/entities/enums/product';
import { hubspotFormatDate } from 'src/helpers/dates';
import { SimStatusEnum } from 'src/entities/enums/sim';
import { IRechargeBuilder } from './interfaces/builders';

export class CRMRecharge {
  public async buildPayload<T>(builder: IRechargeBuilder, payload: T): Promise<void> {
    await builder.setDefaultProperties(payload);
    await builder.updateSim();
    await builder.updateDeal();
  }
}

export class CRMRechargePayload {
  sim: ISim;
  deal: IDeal;
  checkout: Checkout;
}

export class CRMRechargeBuilder implements IRechargeBuilder {
  private simService: SimService;
  private crmPayload: CRMRechargePayload;
  private crmClient: CRMProcessor;
  private dealService: DealService;
  private customObjectService: CustomObjectService;
  private configService: ConfigurationService;
  private hubspotObjectIds: HubspotIds;

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

  private getDealStage(status: SimStatusEnum): { dealstage: string } {
    const dealstage = {
      PreActive: this.hubspotObjectIds.Pipelines.existsSIM.stages.activation as unknown as string,
      Active: this.hubspotObjectIds.Pipelines.existsSIM.stages.activation,
      NotActive: this.hubspotObjectIds.Pipelines.existsSIM.stages.pending,
    };

    return { dealstage: dealstage[status] };
  }

  async setDefaultProperties(payload: any): Promise<void> {
    await this.simService.ormInit();
    const checkout = await this.simService.getCheckoutById(payload?.checkoutId, true);
    const sim: Sim = await this.simService.getSimById(payload?.simId);

    const simPlans = await this.simService.getSimPlanBySimId(sim);

    const plan = simPlans.find((variant) => variant.productId.name === ProductNameEnum.UnlimitedPlans && variant.isActive);
    const validity = simPlans.find((variant) => variant.productId.name === ProductNameEnum.SimValidity && variant.isActive);
    const airtime = simPlans.find((variant) => variant.productId.name === ProductNameEnum.AirTime && variant.isActive);

    this.hubspotObjectIds = (await this.configService.getValue('hubspotIds')) as HubspotIds;

    const pipeLines = this.getDealStage(sim?.status);

    this.crmPayload = {
      deal: {
        dealstage: pipeLines.dealstage,
        sim_validity_date: hubspotFormatDate(validity.expiryDate),
        plan_expire_date: hubspotFormatDate(plan.expiryDate),
        plan_start_date: hubspotFormatDate(plan.startDate),
        paid_at: checkout?.paidAt ? hubspotFormatDate(checkout.paidAt) : null,
      },
      sim: {
        airtime: airtime?.productVariantId?.sku,
        plan: plan?.productVariantId?.sku,
        sim_validity: validity?.productVariantId?.sku,
        plan_expire_date: hubspotFormatDate(plan.expiryDate),
        plan_start_date: hubspotFormatDate(plan.startDate),
        sim_expire_date: hubspotFormatDate(validity?.expiryDate),
      },
      checkout: checkout,
    };
  }

  async updateSim(): Promise<void> {
    await this.customObjectService.update(this.hubspotObjectIds.sim, this.crmPayload.checkout.simId, this.crmPayload.sim);
  }

  async updateDeal(): Promise<void> {
    await this.dealService.update(this.crmPayload.checkout.dealId, this.crmPayload.deal);
  }
}
