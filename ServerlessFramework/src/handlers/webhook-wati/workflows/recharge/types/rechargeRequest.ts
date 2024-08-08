import { Checkout, Sim } from 'src/entities';
import { ProductVariantSkuEnum } from 'src/entities/enums/productVariant';
import { RechargeType } from '../enums/recharge';

export type RechargeRequestPayload = {
  amount: number;
  date: string;
  email: string;
  plan: ProductVariantSkuEnum;
  airtime: ProductVariantSkuEnum;
  validity: ProductVariantSkuEnum;
  whatsappNumber: string;
  serialNumber: string;
  mobileNumber: string;
  sim: Sim;
  rechargeType: RechargeType;
  checkoutId: Checkout;
};
