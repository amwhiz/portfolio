import { SelectedOptions } from 'src/helpers/returnBoolean';

export interface ILocationUpdate {
  EventName: string;
  EventCode: string;
  DateTimeEvent?: string;
  Imsi?: string;
  luStatus?: string;
  Iccid?: string;
  ProductId?: string;
  Msisdn?: string;
  AccountId?: string;
  MCC?: string;
}

export interface IDeliveryTypeUpdate {
  email: string;
  customerName: string;
  whatsappNumber: string;
  selectedOption: string;
  flowName: string;
  line1?: string;
  line?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  deliveryType?: SelectedOptions;
  collectionPoint?: string;
}
