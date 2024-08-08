import { SimType } from 'src/entities/enums/common';

export interface OrderData {
  source: string;
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
  planStartDate: string;
  deviceType: string;
  serialNumber: string | undefined;
  variantId: string;
  home: string;
  device: string;
}
