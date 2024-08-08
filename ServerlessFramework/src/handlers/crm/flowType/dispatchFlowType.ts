/* eslint-disable @typescript-eslint/no-explicit-any */
import { LoggerService, logger as Logger } from '@aw/logger';
import { CRMBuy, CRMBuyBuilder } from './buy';
import { ICRMFlow } from '../interfaces/types';
import { CRMPayment, CRMPaymentBuilder } from './payment';
import { CRMActivation, CRMActivationBuilder } from './activation';
import { CRMRecharge, CRMRechargeBuilder } from './recharge';
import { CRMAccount, CRMAccountBuilder, CRMAccountPayload } from './account';
import { CRMAssociation, CRMAssociationBuilder, CRMAssociationPayload } from './association';
import { CRMCds, CRMCdsBuilder } from './cds';
import { CRMParcelNinja, CRMParcelNinjaBuilder } from './parcelNinja';
import { CRMSimPurchase, CRMSimPurchaseBuilder } from './simPurchase';
import { CRMPartnerTerm, CRMPartnerTermBuilder } from './partnerTerm';
import { CRMCommission, CRMCommissionBuilder } from './commission';

export class DispatchFlowsType {
  static readonly logger: typeof Logger = new LoggerService({ serviceName: DispatchFlowsType.name });

  public static async buy(payload: ICRMFlow): Promise<void> {
    const CRMbuyBuilder = new CRMBuy();
    await CRMbuyBuilder.buildPayload(new CRMBuyBuilder(), payload);
  }

  public static async payment(payload: ICRMFlow): Promise<void> {
    const paymentBuilder = new CRMPayment();
    await paymentBuilder.buildPayload(new CRMPaymentBuilder(), payload);
  }

  public static async activation(payload: ICRMFlow): Promise<void> {
    const activationBuilder = new CRMActivation();
    await activationBuilder.buildPayload(new CRMActivationBuilder(), payload);
  }

  public static async recharge(payload: ICRMFlow): Promise<void> {
    const rechargeBuilder = new CRMRecharge();
    await rechargeBuilder.buildPayload(new CRMRechargeBuilder(), payload);
  }

  public static async account(payload: ICRMFlow): Promise<void> {
    const accountBuilder = new CRMAccount();
    await accountBuilder.buildPayload(new CRMAccountBuilder(payload as CRMAccountPayload));
  }

  public static async association(payload: ICRMFlow): Promise<void> {
    const associationBuilder = new CRMAssociation();
    await associationBuilder.buildPayload(new CRMAssociationBuilder(payload as CRMAssociationPayload));
  }

  public static async cds(payload: ICRMFlow): Promise<void> {
    const cdsService = new CRMCds();
    await cdsService.buildPayload(new CRMCdsBuilder(), payload as any);
  }

  public static async parcelNinja(payload: ICRMFlow): Promise<void> {
    const parcelNinja = new CRMParcelNinja();
    await parcelNinja.buildPayload(new CRMParcelNinjaBuilder(), payload as any);
  }

  public static async simPurchase(payload: ICRMFlow): Promise<void> {
    const simPurchase = new CRMSimPurchase();
    await simPurchase.buildPayload(new CRMSimPurchaseBuilder(), payload as any);
  }

  public static async partnerTerm(payload: ICRMFlow): Promise<void> {
    const partnerTerm = new CRMPartnerTerm();
    await partnerTerm.buildPayload(new CRMPartnerTermBuilder(), payload as any);
  }

  public static async commission(payload: ICRMFlow): Promise<void> {
    const commission = new CRMCommission();
    await commission.buildPayload(new CRMCommissionBuilder(), payload as any);
  }
}
