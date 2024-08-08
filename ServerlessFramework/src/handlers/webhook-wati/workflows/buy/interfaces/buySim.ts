import { SimType } from 'src/entities/enums/common';
import { DeviceType } from '../../enum/deviceType';

export type doorDelivery = 'yes' | 'no';
export interface IBuySim {
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
  deliveryType?: string;
  collectionPoints?: string;
  simType?: SimType;
  serialNumber?: string;
  flowName?: string;
  parentFlowName?: string;
  amount?: string;
  simNumber?: string;
  deviceType?: string;
  device?: DeviceType;
  isDoorDelivery?: doorDelivery;
  selectedOption?: string;
  isCollectionPoint?: doorDelivery;
  referralCode?: string;
}
