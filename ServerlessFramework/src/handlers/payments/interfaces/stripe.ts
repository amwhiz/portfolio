import { CurrencySymbol } from '@aw/pg/enums/regionCurrency';
import { ParentWorkflow } from 'src/enums/workflows';

export interface Payment {
  totalPrice: number;
  checkoutId: number;
  type: ParentWorkflow;
  planStartDate: string;
  serialNumber: string;
  simId: number;
  airtime: string;
  validity: string;
  plan: string;
  device: string;
  currency: CurrencySymbol;
}
