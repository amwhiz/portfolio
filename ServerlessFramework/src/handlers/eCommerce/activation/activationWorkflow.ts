/* eslint-disable @typescript-eslint/no-explicit-any */
import { IActivationBuilder } from './interfaces/activationBuilder';
import { Checkout, Customer, ProductsVariant, Sim, SimActivity, SimPlan } from 'src/entities';
import { SimType } from 'src/entities/enums/common';
import { ActivationExecutiveRequest } from './interfaces/activation';
import SimService from '@handlers/sim/sim';
import ActivationExecute from './activationExecutive';
import { ActivationResponseType } from './types/activation';
import {
  checkIsSameDate,
  dateNow,
  dateType,
  findAndConvertDate,
  formatDate,
  hubspotFormatDate,
  minusOneDay,
  scheduleTimeWithThirtyMin,
} from 'src/helpers/dates';
import { airtime, plans } from 'src/constants/productVariants';
import { RechargeType } from '../enums/rechargeType';
import EventScheduler from '@handlers/webhook-wati/workflows/scheduler';
import { RechargeExecutiveRequest } from '../interfaces/recharge';
import dayjs from 'dayjs';
import { SourceEnum } from 'src/entities/enums/customer';

export class ActivationSim {
  public async buildPayload<T>(builder: IActivationBuilder, payload: T): Promise<ActivationResponseType> {
    await builder.setDefaultProperties(payload);
    return await builder.activateExecutiveSim();
  }
}

export class ActivationPayload {
  email?: string;
  checkoutId?: Checkout = null;
  products?: number[];
  totalPrice?: number = 0;
  serialNumber?: string; // Need for 'already have a sim' flow
  simId?: Sim;
  simSerial?: string;
  simPlan?: SimPlan;
  simActivityId?: SimActivity;
  customerId?: Customer;
  simType?: SimType;
  whatsappNumber?: string;
  planStartDate?: string | Date;
  plan?: string;
  simPlanPlan?: SimPlan;
  simPlanAirtime?: SimPlan;
  simPlanValidity?: SimPlan;
  selectedOption?: string | 'yes';
  productVariant?: ProductsVariant;
  selectedSimPlan?: SimPlan;
  country?: string;
}

export class ActivationBuilder implements IActivationBuilder {
  private activation: ActivationPayload = {};
  private simService: SimService;

  constructor() {
    this.simService = new SimService();
  }

  async getSimPlan(): Promise<SimPlan[]> {
    try {
      const sims = this.activation.simId;

      const productVariants = await this.simService.getPlanProductVariants(this.activation.checkoutId?.countryFrom);

      const plans = await this.simService.getPlans(productVariants, [sims]);
      return plans;
    } catch (e) {
      return [];
    }
  }

  private async getPlan(): Promise<SimPlan[]> {
    return await this.getSimPlan();
  }

  async setDefaultProperties(payload: ActivationPayload): Promise<void> {
    await this.simService.ormInit();

    const customer: Customer = await this.simService.getCustomerByEmail(payload?.email);
    const checkout = await this.simService.getCheckoutBySource(customer, SourceEnum.Shopify);
    this.activation.simId = await this.simService.getSimById(+payload?.simId);
    // Direct Activation
    const plans: SimPlan[] = await this.getPlan();

    this.activation = {
      products: checkout?.productsVariantId,
      customerId: customer,
      email: payload?.email,
      whatsappNumber: customer?.whatsapp,
      simPlanPlan: plans[0],
      selectedSimPlan: plans[1],
      plan: plans[0]?.ecommerceVariantId.sku,
      checkoutId: checkout,
      simId: this.activation.simId,
      planStartDate: hubspotFormatDate(new Date()),
      country: checkout?.countryFrom,
    };
  }

  private buildActivationExecutive(): ActivationExecutiveRequest {
    return {
      email: this.activation.email,
      whatsappNumber: this.activation.whatsappNumber,
      simPlanPlan: this.activation.simPlanPlan,
      plan: this.activation.plan,
      checkoutId: this.activation?.checkoutId,
      simId: this.activation.simId,
      country: this.activation.country,
    };
  }

  private checkIsPlanStartDateToday(planStartDate: string): string {
    const isSameDate = checkIsSameDate(planStartDate); // If same as today date. Only add 30 minutes.
    const scheduleDateAndTime = isSameDate ? dateNow('Date') : minusOneDay(findAndConvertDate(planStartDate), 'date');
    return scheduleTimeWithThirtyMin(scheduleDateAndTime);
  }

  private async buildRechargeExecutive(): Promise<void> {
    try {
      const simPlans = (await this.simService.getSimPlanBySimId(this.activation.simId)).filter((simPlan) => !simPlan.isActive);
      const scheduleClient = new EventScheduler();
      const scheduleDate = this.checkIsPlanStartDateToday(formatDate(dayjs()));

      for (let simPlanIndex = 0; simPlanIndex < simPlans?.length; simPlanIndex++) {
        const simPlan = simPlans[simPlanIndex];

        const isPlan = plans.includes(simPlan.ecommerceVariantId.name);
        const isAirtime = airtime.includes(simPlan.ecommerceVariantId.name);

        const schedulePayload: RechargeExecutiveRequest = {
          email: this.activation.email,
          whatsappNumber: this.activation.whatsappNumber,
          simId: this.activation.simId?.id,
          sim: this.activation.simId,
          isActivation: true,
          isEcommerceRecharge: true,
          checkoutId: this.activation.checkoutId,
        };

        if (isPlan) {
          schedulePayload['plan'] = simPlan?.ecommerceVariantId?.sku;
          schedulePayload['date'] = formatDate(dateType(new Date()));
          schedulePayload['simExpireDate'] = this.activation.planStartDate as string;
          schedulePayload['rechargeType'] = RechargeType.plan;
          schedulePayload['amount'] = simPlan.ecommerceVariantId.price;
          schedulePayload['variantId'] = simPlan.ecommerceVariantId;

          await scheduleClient.createEvent(schedulePayload, RechargeType.validity, scheduleDate);
        }

        if (isAirtime) {
          schedulePayload['airtime'] = simPlan.ecommerceVariantId?.sku;
          schedulePayload['date'] = formatDate(dateType(new Date()));
          schedulePayload['simExpireDate'] = this.activation.planStartDate as string;
          schedulePayload['rechargeType'] = RechargeType.airtime;
          schedulePayload['amount'] = simPlan.ecommerceVariantId.price;
          schedulePayload['variantId'] = simPlan.ecommerceVariantId;

          await scheduleClient.createEvent(schedulePayload, RechargeType.validity, scheduleDate);
        }
      }
    } catch (err) {
      return;
    }
  }

  async activateExecutiveSim(): Promise<ActivationResponseType> {
    const activationPayload = this.buildActivationExecutive();
    //activation
    const executiveActivation = new ActivationExecute();
    const activatedSim = await executiveActivation.doActivation(activationPayload);

    //recharge
    await this.buildRechargeExecutive();

    return activatedSim;
  }
}
