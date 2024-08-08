import { SimType } from 'src/entities/enums/common';
import { Actions } from 'src/enums/actions';

export class BaseProperties {
  firstName?: string;
  lastName?: string;
  whatsappNumber: string;
  email: string;
  home?: string;
  destination?: string;
  planStartDate: string;
  plan?: string;
  simType: SimType;
  deviceType: string;
  device?: string;
  parentName: string;
  flowName: string;
  action?: Actions;
}
