import { Accounts, CommissionConfiguration, ProductsVariant, Commissions, Sim, Order } from 'src/entities';
import { CommissionBuilder } from './interfaces/commissionBuilder';
import { CommissionRequest } from './interfaces/commissionRequest';
import AccountService from '@handlers/account/account';
import SimService from '@handlers/sim/sim';
import { ProductNameEnum } from 'src/entities/enums/product';
import { AppError } from '@libs/api-error';
import { Role } from 'src/entities/enums/account';
import { RelationshipType } from 'src/entities/enums/accountRelationship';
import { ProductVariantCurrencyEnum, ProductVariantNameEnum, ProductVariantSkuEnum } from 'src/entities/enums/productVariant';
import { commissionCalculation } from 'src/utils/commissionCalc';
import { OrderType } from 'src/entities/enums/order';
import { DefaultCommission } from '../constants/defaultCommission';
import { WorkflowBase } from '@handlers/webhook-wati/workflows/pushToQueue';
import { SQSTypes } from 'src/constants/sqs';
import { CRMWorkFlow } from 'src/enums/workflows';
import { SourceEnum } from 'src/entities/enums/customer';
import { Countries } from 'src/constants/countries';
import { LoggerService } from 'packages/aw-logger';

export class CommissionBuilders {
  public async buildPayload(builder: CommissionBuilder, payload: CommissionRequest): Promise<void> {
    await builder.setDefaultProperties(payload);
    await builder.findAccountRelationShips();
    await builder.calculateCommission();
    await builder.createCommission();
  }
}

export class CommissionPayload {
  commissionPercentage?: CommissionConfiguration;
  agencyCommissionAmount: number[];
  partnerCommissionAmount: number[];
  agencyAccount?: Accounts;
  partnerAccount?: Accounts;
  productVariant: ProductsVariant[];
  amount: number;
  agencyCommissionPercent: number[];
  partnerCommissionPercent: number[];
  airtimePercentage?: number = 0;
  validityPercentage?: number = 0;
  planPercentage?: number = 0;
  planAmount?: number = 0;
  airtimeAmount?: number = 0;
  validityAmount?: number = 0;
}

export class Commission extends WorkflowBase implements CommissionBuilder {
  private logger = new LoggerService({ serviceName: Commission.name });
  private commissionPayload: CommissionPayload & CommissionRequest;
  private accountService: AccountService;
  private simService: SimService;
  private isAgencyAccount: boolean;
  private isFreeSim: boolean = false;
  private isFreeSimUpgrade?: boolean = false;

  constructor() {
    super();
    this.accountService = new AccountService();
    this.simService = new SimService();
  }

  async checkoutIsUpgradedSim(): Promise<void> {
    if (this.commissionPayload?.orderId?.type === OrderType.Recharge) {
      const simPlans = await this.simService.getSimPlanBySimId(this.commissionPayload?.simId);
      const orders = await this.simService.getOrderBySimId(this.commissionPayload?.simId);

      const isPortalActivationSim = orders?.find((order) => order.source === SourceEnum.portal && order.type === OrderType.Activation);
      const isFreeSimInclude = !!simPlans.find((simPlan) => simPlan?.productVariantId?.sku === ProductVariantSkuEnum['1GbFreeOffer'])?.id;

      if (isFreeSimInclude && isPortalActivationSim) this.isFreeSimUpgrade = true;

      if (this.commissionPayload?.orderId?.source === SourceEnum.portal) return;
      throw new AppError('Sim not upgrade from free sim. So, No need to process', 202);
    }
  }

  async setDefaultProperties(payload: CommissionRequest): Promise<void> {
    await this.accountService.ormInit();
    await this.simService.ormInit();
    if (!payload?.orderId) throw new AppError('OrderId not found', 404);

    await this.checkoutIsUpgradedSim();

    this.isAgencyAccount = payload?.accountId?.role === Role.AGENCY;
    const lineItems = await this.simService.getLineItemByOrderId(payload?.orderId);
    const plan = lineItems.find((item) => item?.productId?.name === ProductNameEnum?.UnlimitedPlans);

    // ACTIVATIONS OR UPGRADES VIA LINKS - Free Sim
    this.isFreeSim = plan?.productVariantId?.sku === ProductVariantSkuEnum['1GbFreeOffer'];

    this.commissionPayload = {
      productVariant: lineItems?.map((variant) => variant?.productVariantId),
      orderId: payload?.orderId,
      accountId: payload?.accountId,
      simId: payload?.simId,
      amount: lineItems?.map((variant) => variant?.productVariantId?.price).reduce((a, b) => a + b, 0),
      agencyCommissionAmount: [],
      partnerCommissionAmount: [],
      agencyCommissionPercent: [],
      partnerCommissionPercent: [],
      checkoutId: payload?.checkoutId,
    };
  }

  async findParentAccount(relationShip: RelationshipType, account: Accounts): Promise<Accounts> {
    const parentAccount = await this.accountService.findRelationShipAccountsByChildAccounts(account, relationShip);
    return parentAccount?.length ? parentAccount[0]?.parentAccountId : null;
  }

  async findAccountRelationShips(): Promise<void> {
    if (this.isAgencyAccount) {
      const partnerAccount = await this.findParentAccount(RelationshipType.PARTNER_TO_AGENCY, this.commissionPayload.accountId);
      if (partnerAccount?.email) {
        this.commissionPayload.partnerAccount = partnerAccount;
        this.commissionPayload.agencyAccount = this.commissionPayload.accountId;
      } else {
        this.logger.warn('Relationship not found');
        this.commissionPayload.agencyAccount = await this.accountService.findAccountByUniqueColumn(
          null,
          null,
          null,
          +this.commissionPayload.accountId?.id
        );
      }
      return;
    }
    const agencyAccount = await this.findParentAccount(RelationshipType.AGENCY_TO_USER, this.commissionPayload.accountId);
    this.commissionPayload.agencyAccount = agencyAccount;

    if (agencyAccount?.id) {
      const partnerAccount = await this.findParentAccount(RelationshipType.PARTNER_TO_AGENCY, agencyAccount);
      this.commissionPayload.partnerAccount = partnerAccount;
    }
  }

  private async commissionConfigurationByProductVariants(productVariant: ProductsVariant): Promise<CommissionConfiguration> {
    const commissionConfiguration = await this.simService.getCommissionConfigByProductVariant(productVariant);
    return commissionConfiguration;
  }

  private setCommissionPercentage(commissionConfig: CommissionConfiguration, percentCalcAmount: number): void {
    if (commissionConfig?.productVariantId?.name === ProductVariantNameEnum.UnlimitedPlans) {
      this.commissionPayload.planPercentage = commissionConfig.agencyCommissionPercent;
      this.commissionPayload.planAmount = percentCalcAmount;
    }
    if (commissionConfig?.productVariantId?.name === ProductVariantNameEnum.AirTime) {
      this.commissionPayload.airtimePercentage = commissionConfig.agencyCommissionPercent;
      this.commissionPayload.airtimeAmount = percentCalcAmount;
    }
    if (commissionConfig?.productVariantId?.name === ProductVariantNameEnum.SimValidity) {
      this.commissionPayload.validityPercentage = commissionConfig.agencyCommissionPercent;
      this.commissionPayload.validityAmount = percentCalcAmount;
    }
  }

  async calculateCommission(): Promise<void> {
    for (let productVariantIndex = 0; productVariantIndex < this.commissionPayload?.productVariant?.length; productVariantIndex++) {
      const variant = this.commissionPayload.productVariant[productVariantIndex];
      const amount = variant?.price;
      const commissionConfig = await this.commissionConfigurationByProductVariants(variant);
      const percentage = commissionConfig.agencyCommissionPercent;
      const isPlan = variant?.name === ProductVariantNameEnum.UnlimitedPlans;
      let agencyAmount: number;

      if (this.isFreeSimUpgrade && isPlan)
        agencyAmount =
          variant?.currency === ProductVariantCurrencyEnum?.USD
            ? DefaultCommission.agencyUpgradeUSDCommissionAmount
            : DefaultCommission.agencyUpgradeCommissionAmount;
      else if (this.isFreeSim && isPlan)
        agencyAmount =
          this.commissionPayload.orderId?.countryFrom === Countries.Africa
            ? commissionConfig.agencyCommissionDefaultAmount
            : DefaultCommission.agencyFreeSimUSDCommission;
      else agencyAmount = commissionCalculation(amount, percentage);

      this.setCommissionPercentage(commissionConfig, agencyAmount);

      if ((this.isFreeSimUpgrade || this.isFreeSim) && isPlan) this.commissionPayload.planPercentage = 0;

      this.commissionPayload.agencyCommissionAmount.push(agencyAmount);
      this.commissionPayload.agencyCommissionPercent.push(percentage);
      if (this.commissionPayload?.partnerAccount) this.calculatePartnerCommission(agencyAmount);
    }
  }

  private calculatePartnerCommission(agencyAmount: number): void {
    const percentage =
      this.isFreeSim || this.isFreeSimUpgrade
        ? DefaultCommission.partnerCommission
        : this.commissionPayload.partnerAccount?.commission || DefaultCommission.partnerCommission;
    const partnerAmount = commissionCalculation(agencyAmount, percentage);
    this.commissionPayload.partnerCommissionAmount.push(partnerAmount);
    this.commissionPayload.partnerCommissionPercent.push(percentage);
  }

  private sum(values: number[]): number {
    return values?.reduce((a, b) => a + b, 0);
  }

  async createCommission(): Promise<void> {
    const agencyAmount = this.sum(this.commissionPayload?.agencyCommissionAmount);
    const agencyPercent = this.sum(this.commissionPayload?.agencyCommissionPercent);

    const partnerAmount = this.sum(this.commissionPayload?.partnerCommissionAmount);
    const partnerPercent = this.sum(this.commissionPayload?.partnerCommissionPercent);

    const commissionPayload: Partial<Commissions> = {
      agencyId: this.commissionPayload.agencyAccount,
      partnerId: this.commissionPayload.partnerAccount,
      agencyCommissionAmount: agencyAmount,
      agencyPercentage: agencyPercent,
      amount: this.commissionPayload?.amount,
      orderId: this.commissionPayload?.orderId?.id as unknown as Order,
      partnerCommissionAmount: partnerAmount,
      partnerPercentage: partnerPercent,
      simId: (this.commissionPayload?.simId?.id || this.commissionPayload?.simId) as unknown as Sim,
    };

    await this.simService.createCommission(commissionPayload);
    await this.pushToQueue(SQSTypes.crm, {
      agencyId: this.commissionPayload.agencyAccount,
      partnerId: this.commissionPayload.partnerAccount,
      agencyCommissionAmount: agencyAmount,
      agencyPercentage: agencyPercent,
      amount: this.commissionPayload?.amount,
      orderId: this.commissionPayload?.orderId?.id as unknown as Order,
      partnerCommissionAmount: partnerAmount,
      partnerPercentage: partnerPercent,
      simId: (this.commissionPayload?.simId?.id || this.commissionPayload?.simId) as unknown as Sim,
      checkoutId: this.commissionPayload?.checkoutId,
      airtimePercentage: this.commissionPayload.airtimePercentage,
      validityPercentage: this.commissionPayload.validityPercentage,
      planPercentage: this.commissionPayload.planPercentage,
      flowName: CRMWorkFlow.Commission,
      planAmount: this.commissionPayload?.planAmount,
      airtimeAmount: this.commissionPayload?.airtimeAmount,
      validityAmount: this.commissionPayload?.validityAmount,
    });
  }
}
