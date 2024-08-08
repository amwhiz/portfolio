/* eslint-disable @typescript-eslint/no-explicit-any */
import { ProductVariantNameEnum } from 'src/entities/enums/productVariant';
import { InvoiceLineItem, LineItem } from '../types/lineItem';

export const buildLineItems = (lineItems: LineItem[]): InvoiceLineItem => ({
  subTotal: lineItems.map((lineItem) => lineItem.subTotal).reduce((a, b) => a + b, 0),
  amount: lineItems.map((lineItem) => lineItem.amount).reduce((a, b) => a + b, 0),
  vatAmount: lineItems.map((lineItem) => lineItem.vatAmount).reduce((a, b) => a + b, 0),
  plan: lineItems.find((lineItem) => lineItem.type === ProductVariantNameEnum.UnlimitedPlans),
  airtime: lineItems.find((lineItem) => lineItem.type === ProductVariantNameEnum.AirTime),
  validity: lineItems.find((lineItem) => lineItem.type === ProductVariantNameEnum.SimValidity),
  deliveryType: lineItems.find((lineItem) => lineItem.type === ProductVariantNameEnum.DoorDelivery),
});
