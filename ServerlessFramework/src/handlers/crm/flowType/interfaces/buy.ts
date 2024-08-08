import { PaymentStatus } from '@handlers/payments/enums/paymentStatus';

export interface IContact {
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  address?: string;
  address2?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
  destination?: string;
}

export interface ISim {
  sim_validity?: string;
  type?: string;
  serial_number?: string;
  email?: string;
  activation_code?: string;
  smdp_address?: string;
  airtime?: string;
  plan?: string;
  mobile_number?: string;
  mcc_country?: string;
  qr_code?: string;
  sim_number?: string;
  sim_status?: string;
  sim_expire_date?: string;
  plan_expire_date?: string;
  name?: string;
  validity?: string;
  plan_start_date?: string;
}

export interface IDeal {
  order_channel?: string;
  destination?: string;
  dealname?: string;
  plan?: string;
  airtime?: string;
  plan_start_date?: string;
  delivery_type?: string;
  sim_validity?: string;
  sim_validity_date?: string;
  collection_points?: string;
  phone_compatible?: string;
  amount?: string;
  pipeline?: string;
  dealstage?: string;
  sim_type?: string;
  plan_expire_date?: string;
  payment_status?: PaymentStatus;
  payment_link?: string;
  paid_at?: string;
  due_date?: string;
  invoice?: string;
  delivery_address?: string;
  flow_name?: string;
}

export interface ProductValue {
  name: string;
  price: number;
}

export interface Products {
  airtime: ProductValue;
  validity: ProductValue;
  plan: ProductValue;
  doorDelivery: ProductValue;
  spinWheelPlan?: ProductValue;
}
