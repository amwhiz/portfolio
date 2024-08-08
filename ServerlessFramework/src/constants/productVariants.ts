import { ProductNameEnum } from 'src/entities/enums/product';
import { ProductVariantNameEnum } from 'src/entities/enums/productVariant';
import { omit } from 'lodash';

export const plans: ProductVariantNameEnum[] = [ProductVariantNameEnum.UnlimitedPlans];
export const validities: ProductVariantNameEnum[] = [ProductVariantNameEnum.SimValidity];
export const airtime: ProductVariantNameEnum[] = [ProductVariantNameEnum.AirTime];
export const productPlans: string[] = Object.values(omit(ProductNameEnum, ['SimValidity', 'AirTime', 'DoorDelivery']));
