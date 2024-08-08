import { ProductVariantSkuEnum } from 'src/entities/enums/productVariant';
import { SimStatusEnum } from 'src/entities/enums/sim';

export type SimResponseType = {
  id: number;
  status: SimStatusEnum;
  simValidity: ProductVariantSkuEnum;
  mobileNo: string;
  simName?: string;
};
