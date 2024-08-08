import { PaymentTypes } from '@handlers/payments/enums/paymentStatus';
import { PartnerTermAction } from '../enums/partnerTerm';

export interface PartnerTerm {
  invoiceId: string;
  status?: PaymentTypes;
  action?: PartnerTermAction;
}
