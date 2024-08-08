import { ProductNameEnum } from 'src/entities/enums/product';
import { ProductVariantSkuEnum } from 'src/entities/enums/productVariant';

export const formatVariants = (variants: { variant: ProductVariantSkuEnum; type: ProductNameEnum }[]): string => {
  const doFormats = [];

  variants.forEach((variant) => {
    if (ProductNameEnum.UnlimitedPlans === variant.type && variant?.variant)
      doFormats.push(variant.variant.replace(/ -.*/, ' unlimited local and voice'));
    if (ProductNameEnum.AirTime === variant.type && variant.variant) doFormats.push(`airtime ${variant.variant}`);
    if (ProductNameEnum.SimValidity === variant.type && variant.variant)
      doFormats.push(`sim validity ${variant.variant.split('-')[0].replace(' months', 'M').trim()}`);
    if (ProductNameEnum.DoorDelivery === variant.type && variant.variant) doFormats.push(variant.variant.split(' -')[0].toLowerCase());
  });

  const lastElement = doFormats.pop();
  let result = doFormats.join(', ');
  if (lastElement) {
    if (doFormats.length > 0) {
      result += ` and ${lastElement}`;
    } else {
      result += lastElement;
    }
  }

  return result;
};
