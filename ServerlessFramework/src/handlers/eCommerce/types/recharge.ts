import { Sim } from 'src/entities';
import { OrderType } from 'src/entities/enums/order';

export type RechargePayloadType = {
  airtime?: string;
  validity?: string;
  amount: string;
  email: string;
  plan?: string;
  planStartDate?: string;
  mobileNumber?: string;
  simId?: number;
  sim?: Sim;
  customerReferralId?: number;
};

export type RechargeRequest = {
  email?: string;
  offset?: string;
  type?: OrderType;
  mobileNo?: string;
  rewardData?: string;
};
