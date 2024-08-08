import { GetActivationPlanResponseType } from '@aw/cds/types/activationPlan';
import { PassWordCredentialsType } from '@aw/cds/types/auth';
import { Customer } from 'src/entities';

export type activationType = {
  plan: GetActivationPlanResponseType;
  simNo: string;
  date: string;
  email: string;
  credentials: PassWordCredentialsType;
  customer: Customer;
};

export type ActivationResponseType = {
  qrCode: string;
  activationCode: string;
  smtpAddress: string;
  mobileNo: string;
};
