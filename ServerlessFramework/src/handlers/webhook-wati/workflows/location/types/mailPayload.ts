import { Actions } from 'src/enums/actions';

export type MailPayload = {
  customerName: string;
  whatsappNumber: string;
  address: string;
  state: string;
  suburb: string;
  postalCode: string;
  action: Actions;
  name: string;
  email: string;
  template: string;
};
