import { LoggerService, logger as Logger } from '@aw/logger';
import { CustomerReferralResponse } from './interfaces/referral';
import SimService from '@handlers/sim/sim';

export default class CustomerReferralService {
  private logger: typeof Logger;
  private simService: SimService;
  private customerId: number;

  constructor(customerId?: number) {
    this.logger = new LoggerService({ serviceName: CustomerReferralService.name });
    this.simService = new SimService();
    this.customerId = customerId;
  }

  private convertToMB(value: string): number {
    if (value.toLowerCase().endsWith('gb')) {
      return parseFloat(value) * 1024;
    } else if (value.toLowerCase().endsWith('mb')) {
      return parseFloat(value);
    }
  }

  private calculateTotalRewardData(data: CustomerReferralResponse[]): string {
    return data.reduce((total, item) => total + this.convertToMB(item.rewardData), 0) + 'Mb';
  }

  public async getReferralData(): Promise<{ availableFreeData: string; data: CustomerReferralResponse[] }> {
    await this.simService.ormInit();

    this.logger.info('GetReferralData');
    const customers = await this.simService.findReferralByUniqueColumn(this.customerId);

    const response = customers.map((item) => ({
      id: item?.id,
      customerName: item.customerId.firstName,
      rewardData: item.rewardData.sku,
    }));
    this.logger.info(JSON.stringify(response));
    return {
      availableFreeData: this.calculateTotalRewardData(response),
      data: response,
    };
  }
}
