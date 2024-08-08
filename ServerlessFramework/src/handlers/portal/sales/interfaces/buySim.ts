import { DeviceType } from '@handlers/webhook-wati/workflows/enum/deviceType';
import { SimType } from 'src/entities/enums/common';
import { SourceEnum } from 'src/entities/enums/customer';
export type doorDelivery = 'yes' | 'no';

export enum DeliveryType {
  'Door Delivery - R99' = 'Door Delivery - R99',
  'Free Collection Points' = 'Free Collection Points',
}

export interface BuySim {
  customerName: string;
  whatsappNumber: string;
  email: string;
  line1?: string;
  line2?: string;
  city: string;
  postalCode?: string;
  home?: string;
  destination?: string;
  state?: string;
  country?: string;
  planStartDate?: string;
  plan?: string;
  airtime?: string;
  validity?: string;
  deliveryType?: DeliveryType;
  collectionPoints?: string;
  simType?: SimType;
  serialNumber?: string;
  flowName?: string;
  parentFlowName?: string;
  amount?: string;
  simNumber?: string;
  deviceType?: string;
  device?: DeviceType;
  passportNo?: string;
  isDoorDelivery?: doorDelivery;
  sources: SourceEnum;
}
