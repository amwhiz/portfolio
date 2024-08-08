import CdsClient from '@aw/cds';
import { WorkflowBase } from '../pushToQueue';
import { Order, ProductsVariant, SimPlan } from 'src/entities';
import { RechargeExecutiveRequest } from './interfaces/recharge';
import { ProductVariantNameEnum, ProductVariantSkuEnum } from 'src/entities/enums/productVariant';
import { addDayAndFormat, dateNow, dateType, formatDateActivation, hubspotFormatDate, isSimPasteDate, minusOneDay } from 'src/helpers/dates';
import { RechargeType } from './enums/recharge';
import { ExtendSimRequestType } from '@aw/cds/types/extendSim';
import { PassWordCredentialsType } from '@aw/cds/types/auth';
import SimService from '@handlers/sim/sim';
import { LoggerService } from '@aw/logger';
import { KeyType } from '@aw/env';
import { CRMWorkFlow } from 'src/enums/workflows';
import { SQSTypes } from 'src/constants/sqs';
import { convertNormalDate } from 'src/helpers/convertDate';
import { ProductNameEnum } from 'src/entities/enums/product';

export class RechargeExecutivePayload {
  orderId?: Order;
  expiryDate?: string | Date;
  startDate?: string | Date;
  actionDate?: string | Date;
  selectedProductVariant?: ProductsVariant;
  simPlan?: SimPlan;
  addSimValidityPeriodByAirTime?: number;
  addSimValidityDateByAirTime?: Date;
  isActive?: boolean;
  simPlanValidity?: SimPlan;
  simPlanAirtime?: SimPlan;
  isPlanSelected?: boolean;
}

export default class RechargeExecutive extends WorkflowBase {
  private cdsServices: CdsClient;
  private rechargeExecutive: RechargeExecutiveRequest & RechargeExecutivePayload;
  private simService: SimService;
  private logger = new LoggerService({ serviceName: RechargeExecutive.name });

  constructor() {
    super();
    this.cdsServices = new CdsClient();
    this.simService = new SimService();
  }

  async setDefaultProperties(payload: RechargeExecutiveRequest): Promise<void> {
    const sim = await this.simService.getSimById((payload?.simId ?? payload?.sim)?.id);

    let variants: ProductsVariant[];
    if (payload?.checkoutId?.productsVariantId) variants = await this.simService.getProductVariantsByIds(payload?.checkoutId?.productsVariantId);

    this.rechargeExecutive = {
      sim: sim,
      serialNumber: sim?.serialNumber,
      checkoutId: payload?.checkoutId,
      email: sim?.customerId?.email,
      whatsappNumber: sim?.customerId?.whatsapp,
      date: payload?.date,
      airtime: payload?.airtime as ProductVariantSkuEnum,
      validity: payload.validity as ProductVariantSkuEnum,
      amount: payload?.amount,
      mobileNumber: sim?.mobileNo,
      plan: payload?.plan,
      rechargeType: payload?.rechargeType,
      totalPrice: payload?.totalPrice,
      simExpireDate: payload?.simExpireDate,
      isValiditySelected: payload?.isValiditySelected,
      simPlanValidity: payload?.simPlanValidity,
      isPlanSelected: !!variants?.find((variant) => variant?.productId?.name === ProductNameEnum.UnlimitedPlans)?.id,
    };
    this.rechargeExecutive['selectedProductVariant'] = await this.getProductVariant();
  }

  async getProductVariant(): Promise<ProductsVariant> {
    let variant: ProductVariantSkuEnum;

    if (this.rechargeExecutive.rechargeType === RechargeType.airtime) {
      variant = this.rechargeExecutive.airtime;
    } else if (this.rechargeExecutive.rechargeType === RechargeType.plan) {
      variant = this.rechargeExecutive.plan;
    } else if (this.rechargeExecutive.rechargeType === RechargeType.validity) {
      variant = this.rechargeExecutive.validity || this.rechargeExecutive.simPlanValidity?.productVariantId?.sku;
    }

    const productVariant = await this.simService.getProductVariantBySku(variant);
    return productVariant;
  }

  async updateSimPlan(): Promise<void> {
    const simPlans = await this.simService.getSimPlan(
      this.rechargeExecutive.sim,
      this.rechargeExecutive.selectedProductVariant.productId,
      this.rechargeExecutive.selectedProductVariant
    );

    this.rechargeExecutive['simPlan'] = simPlans;

    await this.simService.updateSimPlan(simPlans, {
      expiryDate: this.rechargeExecutive.expiryDate as Date,
      actionDate: this.rechargeExecutive.actionDate as Date,
      startDate: this.rechargeExecutive.startDate as Date,
      isActive: this.rechargeExecutive.isActive,
    });
  }

  async getSimValidity(): Promise<void> {
    /* TODO document why this async method 'getSimValidity' is empty */
  }

  // Extend sims validity
  async extendSim(credentials: PassWordCredentialsType, date: string): Promise<void> {
    const extendSim: ExtendSimRequestType = {
      Pass: credentials.Password,
      Action: 'Modify',
      MobileNo: this.rechargeExecutive.mobileNumber,
      PlanExpiryDt: date,
      UsrID: credentials.UserID,
    };
    await this.cdsServices.validitySim(null, extendSim, this.rechargeExecutive.email);
  }

  async canAddSimValidity(credentials: PassWordCredentialsType): Promise<void> {
    const simExpireDateIsBeforeAirtime = isSimPasteDate(this.rechargeExecutive.simExpireDate);
    this.rechargeExecutive.addSimValidityPeriodByAirTime = 30;
    if (!simExpireDateIsBeforeAirtime) {
      this.rechargeExecutive.addSimValidityDateByAirTime = dateNow('Date') as Date;
      await this.doSimValidity(credentials);
    }
  }

  async doAirTime(credentials: PassWordCredentialsType): Promise<void> {
    const airtimePayload = {
      ...credentials,
      MobileNo: this.rechargeExecutive.mobileNumber,
      RechargeAmt: `${this.rechargeExecutive.amount}`,
      PlanName: '',
      PlanCode: this.rechargeExecutive.selectedProductVariant.planCode,
    };

    await this.cdsServices.rechargeSim(null, airtimePayload, this.rechargeExecutive.email);
    const airtimeDate = addDayAndFormat(this.rechargeExecutive.date, 30, 'date') as string;
    await this.extendSim(credentials, airtimeDate);

    this.rechargeExecutive['actionDate'] = minusOneDay(airtimeDate, 'date');
    this.rechargeExecutive['startDate'] = convertNormalDate(this.rechargeExecutive.date);
    this.rechargeExecutive['expiryDate'] = new Date(airtimeDate);
    this.rechargeExecutive['isActive'] = true;

    if (!this.rechargeExecutive.isValiditySelected) await this.canAddSimValidity(credentials);
    await this.updateSimPlan();
  }

  async doSimValidity(credentials: PassWordCredentialsType): Promise<void> {
    const fromSimValidity = this.rechargeExecutive.selectedProductVariant?.validityPeriod + (this.rechargeExecutive?.isPlanSelected ? 30 : 0);
    const addValidityPeriod: number = this.rechargeExecutive.addSimValidityPeriodByAirTime || fromSimValidity;
    const addValidityDate = this.rechargeExecutive.addSimValidityDateByAirTime || this.rechargeExecutive.simExpireDate;
    const date = addDayAndFormat(addValidityDate, addValidityPeriod, 'date');
    await this.extendSim(credentials, formatDateActivation(dateType(date)));

    this.rechargeExecutive['actionDate'] = minusOneDay(date, 'date');
    this.rechargeExecutive['startDate'] = convertNormalDate(this.rechargeExecutive.date);
    this.rechargeExecutive['expiryDate'] = date as string;
    this.rechargeExecutive['isActive'] = true;
    await this.updateSimPlan();
  }

  async getActiveValidity(): Promise<SimPlan> {
    const simPlans = await this.simService.getSimPlanBySimId(this.rechargeExecutive.sim);
    return simPlans.find((variant) => variant.productVariantId?.name === ProductVariantNameEnum.SimValidity);
  }

  async doPlan(credentials: PassWordCredentialsType): Promise<void> {
    const _planDate = addDayAndFormat(this.rechargeExecutive.date, this.rechargeExecutive.selectedProductVariant.validityPeriod, 'date');
    const planPayload = {
      ...credentials,
      RechargeAmt: `${this.rechargeExecutive.amount}`,
      PlanCode: this.rechargeExecutive.selectedProductVariant.planCode,
      MobileNo: this.rechargeExecutive.mobileNumber,
    };
    await this.cdsServices.rechargeSim(null, planPayload, this.rechargeExecutive.email);
    this.rechargeExecutive['actionDate'] = minusOneDay(_planDate, 'date');
    this.rechargeExecutive['startDate'] = convertNormalDate(this.rechargeExecutive.date);
    this.rechargeExecutive['expiryDate'] = _planDate as string;
    this.rechargeExecutive['isActive'] = true;

    await this.updateSimPlan();
    this.rechargeExecutive['selectedProductVariant'] = await this.simService.getProductVariantBySku(ProductVariantSkuEnum['30Days-Free']);

    if (!this.rechargeExecutive?.isValiditySelected) {
      this.rechargeExecutive.simPlanValidity = await this.getActiveValidity();
      this.rechargeExecutive['selectedProductVariant'] = this.rechargeExecutive.simPlanValidity?.productVariantId;
      this.rechargeExecutive.addSimValidityPeriodByAirTime = 30;
      this.rechargeExecutive.simExpireDate = hubspotFormatDate(this.rechargeExecutive.simPlanValidity.expiryDate);
      await this.doSimValidity(credentials);
    }
  }

  async doRecharge(payload: RechargeExecutiveRequest): Promise<void> {
    await this.simService.ormInit();
    await this.setDefaultProperties(payload);
    const credentials = this.cdsServices.getCredentials();

    switch (payload?.rechargeType) {
      case RechargeType.airtime:
        await this.doAirTime(credentials);
        break;
      case RechargeType.validity:
        await this.doSimValidity(credentials);
        break;
      case RechargeType.plan:
        await this.doPlan(credentials);
        break;
      default:
        this.logger.error('Nothing to handle');
    }

    await this.queueProcess(SQSTypes.crm, {
      checkoutId: this.rechargeExecutive.checkoutId.id,
      flowName: CRMWorkFlow.Recharge,
      simId: this.rechargeExecutive.sim.id,
    });

    await this.simService.closeConnection();
  }

  private async queueProcess(queueName: KeyType, notificationData: object = {}, templateName?: string): Promise<void> {
    await super.pushToQueue(queueName, {
      templateName,
      ...notificationData,
    });

    // Delay the execution 3 seconds, Otherwise notification receiving order might be changed.
    super.delay(3000);
  }
}
