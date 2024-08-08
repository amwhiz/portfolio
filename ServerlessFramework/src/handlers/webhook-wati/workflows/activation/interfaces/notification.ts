import { Actions } from 'src/enums/actions';

export type ActivationNotification = {
  whatsappNumber: string;
  mobileNo: string;
  smtps?: string;
  activationCode?: string;
  qrImage?: string;
  device?: string;
  action?: Actions;
  shipmentDetails?: 'Shiprocket';
};
