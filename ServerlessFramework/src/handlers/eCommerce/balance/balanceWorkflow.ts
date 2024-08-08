/* eslint-disable @typescript-eslint/no-explicit-any */
import SimService from '@handlers/sim/sim';
import { Sim } from 'src/entities';
import { SimStatusEnum } from 'src/entities/enums/sim';
import { BalanceNotificationType, RemainingData } from './types/balanceNotificationType';
import { ProductVariantSkuEnum } from 'src/entities/enums/productVariant';
import CdsClient from 'packages/aw-cds';
import { MessageDataType } from 'packages/aw-cds/types/getBalance';
import { differenceInDays, hubspotFormatDate } from 'src/helpers/dates';
import { formatMegaBytesToGigBytes } from 'src/helpers/formatMegaBytesToGigaBytes';
import { Regions } from 'packages/aw-cds/enums/region';

export class BalancePayload {
  mobileNo?: string;
  limit?: string;
  offset?: string;
}

export class BalanceBuilder {
  private simService: SimService;
  private cdsServices: CdsClient;
  private balancePayload: BalancePayload;

  constructor(balancePayload: BalancePayload) {
    this.balancePayload = balancePayload;
    this.simService = new SimService();
    this.cdsServices = new CdsClient();
  }

  private async getBalance(sim: Sim): Promise<any> {
    const credentials = await this.cdsServices.getGlobalCredentials(sim?.countryFrom as Regions);
    const subscriberInfo = await this.cdsServices.getBalance(true, { MobileNo: sim?.mobileNo, ...credentials }, sim?.customerId?.email);
    return subscriberInfo.MessageData as MessageDataType;
  }

  private async parseBalanceArray(sim: Sim): Promise<BalanceNotificationType> {
    const simUsageData = await this.getBalance(sim);
    const simUsageResponse: BalanceNotificationType = {
      simStatus: simUsageData?.SimStatus ?? SimStatusEnum.PreActive,
      mobileNo: sim?.mobileNo,
      simValidity: ProductVariantSkuEnum['30Days-Free'],
      usage: [],
    };

    if (!simUsageData?.balances?.length) return simUsageResponse;

    const simUsage: RemainingData[] = simUsageData?.balances.map((balance) => {
      let type = '';
      let data = '';
      const remainingValidity = differenceInDays(balance.expirationDate);

      if (balance.balanceName === 'Data') {
        if (hubspotFormatDate(balance?.creationDate) === hubspotFormatDate(simUsageData?.ActDate)) {
          type = 'remainingFreeData';
          data = formatMegaBytesToGigBytes(balance?.outstandingAmount);
        } else {
          type = 'remainingTopupData';
          data = formatMegaBytesToGigBytes(balance?.outstandingAmount);
        }
      } else if (balance.balanceName === 'Time') {
        type = 'remainingVoiceMins';
        data = `${balance?.outstandingAmount} Minutes`;
      }

      return {
        type,
        data,
        coverage: 'Global',
        remainingValidity,
      };
    });
    simUsageResponse['usage'] = simUsage.filter((balance) => balance.type);
    return simUsageResponse;
  }

  async checkBalance(): Promise<BalanceNotificationType> {
    await this.simService.ormInit();

    const sim = await this.simService.getSimByMobileNumber(this.balancePayload.mobileNo);

    const simUsage = await this.parseBalanceArray(sim);
    await this.simService.closeConnection();
    return simUsage;
  }
}
