import { ShopifyAttributes } from '@handlers/eCommerce/enums/shopify';
import { OrderData } from '@handlers/eCommerce/interfaces/order';
import { SimType } from 'src/entities/enums/common';
import { CustomerSourceEnum } from 'src/entities/enums/customerReferral';
import { OrderType } from 'src/entities/enums/order';
import { ProductVariantSkuEnum } from 'src/entities/enums/productVariant';

const getAttributesValue = (attributes: { name: string; value: string }[], attributeName: string): string =>
  attributes.find((attribute) => attribute?.name === attributeName)?.value ?? null;

/* eslint-disable @typescript-eslint/no-explicit-any */
export const eCommerceRequestBuild = (data: any): OrderData => {
  const attributes = data.note_attributes;
  return {
    source: data.shipping_lines?.length ? data.shipping_lines[0]?.source : null,
    orderNumber: data.order_number,
    amount: +getAttributesValue(attributes, ShopifyAttributes.totalPrice),
    email: data.contact_email || data.customer.email,
    customerName: data.billing_address.name,
    firstName: data.billing_address.first_name,
    lastName: data.billing_address.last_name || '',
    line1: data.billing_address.address1,
    line2: data.billing_address.address2 || '',
    whatsappNumber: getAttributesValue(attributes, ShopifyAttributes.whatsappNumber),
    city: data.billing_address.city,
    state: data.billing_address.province,
    country: data.billing_address.country,
    postalCode: data.billing_address.zip,
    countryCode: data.billing_address.country_code,
    validity: ProductVariantSkuEnum['30Days-Free'],
    simType: SimType.eSIM,
    deviceType: getAttributesValue(attributes, ShopifyAttributes.device),
    plan: getAttributesValue(attributes, ShopifyAttributes.spinWheelPlan),
    extraPlan: getAttributesValue(attributes, ShopifyAttributes.selectedPlan)?.replace(/\s+/g, '') ?? null,
    airtime: getAttributesValue(attributes, ShopifyAttributes.selectedAirtime),
    home: getAttributesValue(attributes, ShopifyAttributes.countryFrom),
    destination: getAttributesValue(attributes, ShopifyAttributes.countryTravelTo),
    referralCode: getAttributesValue(attributes, ShopifyAttributes.referralCode),
    referralSource: getAttributesValue(attributes, ShopifyAttributes.referralSource) as CustomerSourceEnum,
    type: getAttributesValue(attributes, ShopifyAttributes.type) as OrderType,
    mobileNo: getAttributesValue(attributes, ShopifyAttributes.mobileNo),
  };
};
