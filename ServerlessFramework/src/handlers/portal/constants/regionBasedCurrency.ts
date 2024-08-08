import { Countries } from 'src/constants/countries';
import { ZONE } from 'src/entities/enums/account';
import { ProductVariantCurrencyEnum } from 'src/entities/enums/productVariant';

export const RegionBasedCurrency = {
  [ZONE.Domestic]: ProductVariantCurrencyEnum.ZAR,
  [ZONE.International]: ProductVariantCurrencyEnum.USD,
};

export const currencyBasedHome = {
  [ProductVariantCurrencyEnum.ZAR]: Countries.Africa,
  [ProductVariantCurrencyEnum.USD]: Countries.Usa,
};
