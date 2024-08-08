import { Sim, Checkout, SimPlan } from 'src/entities';
import { ProductVariantSkuEnum } from 'src/entities/enums/productVariant';
import { RechargeType } from '../enums/recharge';

export interface RechargeExecutiveRequest {
  amount: number;
  date: string;
  email: string;
  plan: ProductVariantSkuEnum;
  airtime: ProductVariantSkuEnum;
  validity: ProductVariantSkuEnum;
  whatsappNumber: string;
  serialNumber: string;
  mobileNumber: string;
  sim?: Sim;
  simId?: Sim;
  rechargeType: RechargeType;
  checkoutId: Checkout;
  totalPrice: number;
  simExpireDate?: string;
  simActivityId?: string;
  isValiditySelected?: string;
  simPlanValidity?: SimPlan;
  simPlanAirtime?: SimPlan;
  simPlanPlan?: SimPlan;
}
