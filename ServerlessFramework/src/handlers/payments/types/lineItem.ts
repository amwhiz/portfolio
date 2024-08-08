import { ProductVariantNameEnum, ProductVariantSkuEnum } from 'src/entities/enums/productVariant';

export type InvoiceLineItem = {
  subTotal: number;
  amount: number;
  vatAmount: number;
  plan: LineItem;
  airtime: LineItem;
  validity: LineItem;
  deliveryType: LineItem;
};

export type LineItem = {
  serialNo: number;
  subTotal: number;
  amount: number;
  vatAmount: number;
  value: ProductVariantSkuEnum;
  type: ProductVariantNameEnum;
};
