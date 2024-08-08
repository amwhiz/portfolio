import { LineItem } from '@handlers/payments/types/lineItem';
import { ProductsVariant } from 'src/entities';

export const calculateInvoiceAmount = (variant: ProductsVariant, serialNo?: number): LineItem => {
  const amount = variant?.price;
  const subTotal = amount / 1.15; // Calculate subtotal by dividing the amount by 1.15 (15% VAT rate)

  return {
    serialNo,
    amount: parseFloat((subTotal + amount - subTotal).toFixed(2)),
    subTotal: parseFloat(subTotal.toFixed(2)),
    vatAmount: parseFloat((amount - subTotal).toFixed(2)),
    type: variant?.name,
    value: variant?.sku,
  };
};
