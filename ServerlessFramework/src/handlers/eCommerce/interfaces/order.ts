import { SimType } from 'src/entities/enums/common';
import { CustomerSourceEnum } from 'src/entities/enums/customerReferral';
import { OrderType } from 'src/entities/enums/order';

export interface OrderData {
  source?: string;
  orderNumber: number;
  amount: number;
  email: string;
  customerName: string;
  firstName: string;
  lastName: string;
  line1: string;
  line2: string;
  whatsappNumber: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  countryCode: string;
  validity: string;
  simType: SimType;
  deviceType: string;
  plan: string;
  extraPlan: string;
  airtime: string;
  home: string;
  referralCode?: string;
  referralSource?: CustomerSourceEnum;
  simName?: string;
  destination?: string;
  type?: OrderType;
  mobileNo?: string;
}
