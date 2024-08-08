import { OrderData } from '@handlers/shopify/interfaces/order';
import { ProductVariantSkuEnum } from 'src/entities/enums/productVariant';

/* eslint-disable @typescript-eslint/no-explicit-any */
export const shopifyRequestBuild = (data: any): OrderData => {
  const lineItems = data.line_items[0].properties;
  return {
    source: data.shipping_lines[0].source,
    orderNumber: data.order_number,
    amount: data.current_total_price,
    email: data.contact_email || data.customer.email,
    customerName: data.billing_address.name,
    firstName: data.billing_address.first_name,
    lastName: data.billing_address.last_name || '',
    line1: data.billing_address.address1,
    line2: data.billing_address.address2 || '',
    whatsappNumber: data.billing_address.phone,
    city: data.billing_address.city,
    state: data.billing_address.province,
    country: data.billing_address.country,
    postalCode: data.billing_address.zip,
    countryCode: data.billing_address.country_code,
    validity: ProductVariantSkuEnum['30Days-Free'],
    simType: lineItems[0].value.toLowerCase(),
    planStartDate: lineItems[1].value,
    deviceType: lineItems[2].value,
    serialNumber: lineItems[4]?.value,
    variantId: data.line_items[0]?.variant_id,
    home: data.billing_address.country,
    device: lineItems[3].value,
  };
};
