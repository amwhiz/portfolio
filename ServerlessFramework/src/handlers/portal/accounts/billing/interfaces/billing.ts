import { BillingTypes } from '../enums/billingTypes';

export interface IBilling {
  type?: BillingTypes;
  startDate: string;
  endDate: string;
}
