import SimService from '@handlers/sim/sim';
import { GeneralType, Properties } from './interfaces/general';
import { groupBy } from 'lodash';
import { countriesData } from './data/countries';
import { destinations, internationalDestination } from './data/destinations';
import { simTypes } from './data/simTypes';
import { ProductVariantCurrencyEnum, ProductVariantNameEnum, ProductVariantSkuEnum } from 'src/entities/enums/productVariant';
import { ProductsVariant } from 'src/entities';
import { ProductNameEnum } from 'src/entities/enums/product';
import { selectedPropertiesByUserDefine } from 'src/helpers/selectedProperties';
import { BatchResponseProperty } from '@aw/crm/crm/aw-hubspot/services/properties.service';
import { HubspotCRM } from '@aw/crm/crm/aw-hubspot';
import { PropertiesService } from '@aw/crm/interfaces/crmServices';
import { RegionBasedCurrency } from '../constants/regionBasedCurrency';
import { env } from '@aw/env';
import { CRMProcessor } from '@aw/crm';
import { ZONE } from 'src/entities/enums/account';
import { DeliveryType } from '../sales/interfaces/buySim';

export class GeneralService {
  private simService: SimService;
  private zone: ZONE;
  private propertiesService: PropertiesService;
  private properties: string[] = ['partner_level', 'region', 'market_sector_category'];
  private crmClient: CRMProcessor;

  constructor(zone: ZONE) {
    this.simService = new SimService();
    this.zone = zone;
    const client = new HubspotCRM({
      accessToken: env('hubspotToken'),
    });
    this.crmClient = new CRMProcessor(client);
    this.propertiesService = this.crmClient.properties();
  }

  async regionBasedProductVariants(): Promise<{ [key in ProductNameEnum]: Omit<Properties, 'value'>[] }> {
    await this.simService.ormInit();
    const zone = RegionBasedCurrency[this.zone] ?? ProductVariantCurrencyEnum.ZAR;
    const variants = await this.simService.getProductVariantsBasedCurrency(true, zone);

    if (zone === ProductVariantCurrencyEnum.USD) {
      variants.push({
        price: 0,
        sku: ProductVariantSkuEnum['1GbFreeOffer'],
        name: ProductVariantNameEnum.UnlimitedPlans,
      } as ProductsVariant);
      variants.push({
        price: 0,
        sku: ProductVariantSkuEnum['30Days-Free'],
        name: ProductVariantNameEnum.SimValidity,
      } as ProductsVariant);
    }

    variants.push({
      price: 0,
      sku: 'Not Required' as unknown as ProductVariantSkuEnum,
      name: ProductVariantNameEnum.AirTime,
    } as ProductsVariant);

    return groupBy(
      variants.map((variant) => {
        const properties = selectedPropertiesByUserDefine<ProductsVariant>(variant, ['price', 'sku', 'name']);
        return { name: properties?.['sku'], price: properties?.['price'], productName: properties?.['name'] } as Partial<ProductsVariant>;
      }),
      'productName'
    ) as { [key in ProductNameEnum]: Omit<Properties, 'value'>[] };
  }

  async hubspotProperties(): Promise<{ [key: string]: { value: string }[] }[]> {
    const properties: BatchResponseProperty['results'] = await this.propertiesService.batchRead('agencies', this.properties);
    return properties?.map((property) => ({ [property.name]: property.options?.map((option) => ({ value: option?.value })) }));
  }

  async general(): Promise<GeneralType> {
    const [variants, hubspotProps] = await Promise.all([this.regionBasedProductVariants(), this.hubspotProperties()]);
    if (+this.zone === ZONE.Domestic) {
      variants['Door Delivery'].push({
        price: 0,
        name: DeliveryType['Free Collection Points'] as unknown as ProductVariantSkuEnum,
      });
    }

    if (+this.zone === ZONE.International) {
      variants['Door Delivery'].push({
        price: 0,
        name: DeliveryType['Free Collection Points'] as unknown as ProductVariantSkuEnum,
      });
    }

    const generalTypes: GeneralType = {
      countries: countriesData,
      destinations: +this.zone === ZONE.Domestic ? destinations : internationalDestination,
      variants: {
        plan: variants['Unlimited plans'],
        airtime: variants.Airtime,
        validity: variants['Sim validity'],
        delivery: variants['Door Delivery'],
      },
      simTypes: simTypes,
      ...hubspotProps.reduce((acc, obj) => ({ ...acc, ...obj }), {}),
    };

    return generalTypes;
  }
}
