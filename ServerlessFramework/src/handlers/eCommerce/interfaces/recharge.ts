import { Sim, Checkout, SimPlan } from 'src/entities';
import { ProductVariantSkuEnum } from 'src/entities/enums/productVariant';
import { RechargeType } from '../enums/rechargeType';

export interface RechargeExecutiveRequest {
  amount?: number;
  date?: string;
  email: string;
  plan?: ProductVariantSkuEnum;
  airtime?: ProductVariantSkuEnum;
  validity?: ProductVariantSkuEnum;
  whatsappNumber: string;
  mobileNumber?: string;
  sim?: Sim;
  simId?: number;
  rechargeType?: RechargeType;
  checkoutId: Checkout;
  totalPrice?: number;
  simExpireDate?: string;
  simActivityId?: string;
  isValiditySelected?: string;
  simPlanValidity?: SimPlan;
  simPlanAirtime?: SimPlan;
  simPlanPlan?: SimPlan;
  serialNumber?: string;
  isActivation?: boolean;
  isEcommerceRecharge?: boolean;
}
