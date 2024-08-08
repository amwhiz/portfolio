import { IWorkflow } from 'src/interfaces/workflows';
import { BuyBuilder, BuySim } from './buy/buyWorkflow';
import { ActivationBuilder, ActivationSim } from './activation/activationWorkflow';
import { RechargeBuilder, RechargeSim } from './recharge/rechargeWorkflow';
import { BalanceBuilder, BalancePayload } from './balance/balanceWorkflow';
import { BuyFreeSim, BuyFreeSimBuilder } from './buy/buyFreeSimWorkflow';
import { ConfigurationService } from 'src/configurations/configService';
import { BuyPartnerBuilder, BuyPartnerSim } from './buy/buyPartnerWorkflow';
import { Location, LocationBuilder, LocationProperties } from './location/location';
import { IDeliveryTypeUpdate } from '@handlers/thirdParties/interfaces/locationUpdate';

export class DispatchWorkflows {
  private static configService: ConfigurationService;

  public static async buy(payload: IWorkflow): Promise<void> {
    this.configService = ConfigurationService.getInstance();

    const isFreeSim = [
      ...(<string[]>await this.configService.getValue('freeSimActivationFlow')),
      ...(<string[]>await this.configService.getValue('freeSimNotActivationFlow')),
    ].includes(payload?.flowName);

    const isPartnerFlow = (<string[]>await this.configService.getValue('partnerFlows')).includes(payload?.flowName);

    if (isFreeSim) {
      const buyFreeSimBuilder = new BuyFreeSim();
      return await buyFreeSimBuilder.buildPayload(new BuyFreeSimBuilder(), payload);
    }

    if (isPartnerFlow) {
      const buyPartnerBuilder = new BuyPartnerSim();
      return await buyPartnerBuilder.buildPayload(new BuyPartnerBuilder(), payload);
    }

    const buyBuilder = new BuySim();
    await buyBuilder.buildPayload(new BuyBuilder(), payload);
  }

  public static async Activation(payload: IWorkflow): Promise<void> {
    const activationBuilder = new ActivationSim();
    await activationBuilder.buildPayload(new ActivationBuilder(), payload);
  }

  public static async Recharge(payload: IWorkflow): Promise<void> {
    const rechargeBuilder = new RechargeSim();
    await rechargeBuilder.buildPayload(new RechargeBuilder(), payload);
  }

  public static async Balance(payload: IWorkflow): Promise<void> {
    const balanceBuilder = new BalanceBuilder(payload as BalancePayload);
    await balanceBuilder.checkBalance();
  }

  public static async Location(payload: IWorkflow): Promise<void> {
    const locationBuilder = new LocationBuilder();
    await locationBuilder.buildPayload(new Location(payload as unknown as IDeliveryTypeUpdate & LocationProperties));
  }
}
