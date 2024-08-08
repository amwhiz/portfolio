import { Accounts } from 'src/entities';
import { FormTypes } from '../enums/forms';
import { DeviceType } from '@handlers/webhook-wati/workflows/enum/deviceType';
import { SimType } from 'src/entities/enums/common';

export interface IFormsWebhook {
  formType?: FormTypes;
  account?: Accounts;
  sims: PortalSim | PortalSim[];
}

export interface PortalSim {
  customerName?: string;
  whatsappNumber?: string;
  email: string;
  line1?: string;
  line2?: string;
  city?: string;
  postalCode?: string;
  home?: string;
  destination?: string;
  state?: string;
  country?: string;
  planStartDate?: string;
  plan?: string;
  airtime?: string;
  validity?: string;
  deliveryType?: string;
  collectionPoints?: string;
  simType?: SimType;
  serialNumber?: string;
  flowName?: string;
  parentFlowName?: string;
  amount?: number;
  simNumber?: string;
  deviceType?: string;
  device?: DeviceType;
  passportNo?: string;
  isDoorDelivery?: boolean;
  expiryTime?: number;
  startDate?: string;
  endDate?: string;
}
