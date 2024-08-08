import SimService from '@handlers/sim/sim';
import { Configurations, HubspotIds, Location, ShopifyVariants, StageDescriptions, configures } from '../types/configuration';
import { configurationsEnum } from 'src/entities/enums/configuration';

export class ConfigurationService {
  private static instance: ConfigurationService;
  private configValues: Configurations = {} as Configurations;
  private configLoaded: boolean = false;

  private constructor() {
    // Load configuration values here, you can load from environment variables, a file, or any other source
    this.loadConfigValues();
  }

  public static getInstance(): ConfigurationService {
    if (!ConfigurationService.instance) {
      ConfigurationService.instance = new ConfigurationService();
    }
    return ConfigurationService.instance;
  }

  private async loadConfigValues(): Promise<void> {
    // Load configuration values from wherever you prefer
    const configurationValues = await this.getConfig();
    this.configValues = {};
    this.configLoaded = true; // Set the flag to indicate that configuration values are loaded
  }

  private async getConfig(): Promise<configures> {
    const service = new SimService();
    await service.ormInit();
    const configs = await service.getConfigurations();
    const configures: configures = {} as configures;
    configs.forEach((item) => {
      const { option_name, option_value } = item;
      if (configurationsEnum?.[option_name]) configures[option_name] = option_value;
    });
    return configures;
  }

  public async getValue(key: keyof Configurations): Promise<string | string[] | HubspotIds | StageDescriptions | ShopifyVariants | Location[]> {
    if (!this.configLoaded) await this.loadConfigValues();
    return this.configValues[key];
  }
}
