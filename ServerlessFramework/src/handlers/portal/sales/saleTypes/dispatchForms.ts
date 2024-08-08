import { IFormsWebhook } from '../interfaces/sales';
import { WorkflowBase } from '@handlers/webhook-wati/workflows/pushToQueue';
import { BuySimBuilderService, PortalBuySim } from './buySim/buySim';
import { CompleteSimBuilderService, PortalCompleteSim } from './buySim/completeSim';
import { RechargeBuilderService, PortalRecharge } from './recharge/recharge';
import { CheckoutPayload, PortalCreateCheckout, CheckoutBuilder } from '@handlers/checkout';
import { SourceEnum } from 'src/entities/enums/customer';

export class DispatchForms extends WorkflowBase {
  private static async createCheckout(payload: IFormsWebhook): Promise<CheckoutPayload> {
    const buyBuilder = new PortalCreateCheckout();
    const sim = await buyBuilder.buildPayload(
      new CheckoutBuilder(),
      { ...payload?.sims, sources: SourceEnum.portal, flowType: payload?.formType },
      payload?.account
    );
    return sim;
  }

  public static async buySim(payload: IFormsWebhook): Promise<void> {
    const checkoutDocument = await this.createCheckout(payload);
    const simBuilder = new PortalBuySim();
    await simBuilder.buildPayload(new BuySimBuilderService(), checkoutDocument, payload.formType);
  }

  public static async completeSim(payload: IFormsWebhook): Promise<void> {
    const checkoutDocument = await this.createCheckout(payload);

    const simBuilder = new PortalCompleteSim();
    await simBuilder.buildPayload(new CompleteSimBuilderService(), checkoutDocument);
  }

  public static async rechargeSim(payload: IFormsWebhook): Promise<void> {
    const checkoutDocument = await this.createCheckout(payload);

    const simBuilder = new PortalRecharge();
    await simBuilder.buildPayload(new RechargeBuilderService(), { ...checkoutDocument, mobileNumber: payload?.sims['mobileNumber'] });
  }
}
