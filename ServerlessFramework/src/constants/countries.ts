import { ProductVariantCurrencyEnum } from 'src/entities/enums/productVariant';

export const Countries = {
  Africa: 'Africa',
  Usa: 'usa',
  India: 'India',
};

export const CountriesBasedCurrency = {
  Africa: ProductVariantCurrencyEnum['ZAR'],
  ROW: ProductVariantCurrencyEnum['USD'],
};
