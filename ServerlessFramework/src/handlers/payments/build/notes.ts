import { IPeachPayment } from '@aw/pg/aw-peach/interfaces/payment';
import { ParentWorkflow } from 'src/enums/workflows';
import { Payment } from '../interfaces/stripe';
import { CurrencySymbol } from '@aw/pg/enums/regionCurrency';
import { getAmount } from 'src/helpers/getAmount';
import { Providers } from '@aw/pg/enums/providers';

export const peachBuildNotes = (payload: IPeachPayment): Payment => {
  const notes = payload?.payment?.payment?.notes.split(',');
  const [checkoutId, planStartDate, type, simId, airtime, validity, plan, serialNumber, device] = notes;
  return {
    checkoutId: checkoutId as unknown as number,
    planStartDate,
    serialNumber,
    type: type as ParentWorkflow,
    simId: simId as unknown as number,
    airtime,
    validity,
    plan,
    device,
    currency: payload?.payment?.payment?.currency as CurrencySymbol,
    totalPrice: payload?.payment?.payment?.amount,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const stripeBuildNotes = (payload: any): Payment => ({
  checkoutId: payload?.metadata?.checkoutId ?? payload?.metadata?.partnerNotes,
  planStartDate: payload?.metadata?.planStartDate ?? payload?.metadata?.invoiceId,
  serialNumber: payload?.metadata?.serialNumber,
  type: payload?.metadata?.type,
  simId: payload?.metadata?.simId,
  airtime: payload?.metadata?.airtime,
  validity: payload?.metadata?.validity,
  plan: payload?.metadata?.plan,
  device: payload?.metadata?.device,
  currency: payload?.currency,
  totalPrice: getAmount(payload?.amount_total),
});

export const paymentBuild = (paymentProvider: Providers, event: unknown): Payment =>
  paymentProvider === Providers.Peach ? peachBuildNotes(event) : stripeBuildNotes(event);
