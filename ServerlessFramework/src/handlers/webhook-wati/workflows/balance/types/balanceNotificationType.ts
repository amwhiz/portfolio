import { SimStatusEnum } from 'src/entities/enums/sim';
import { Actions } from 'src/enums/actions';

export type BalanceNotificationType = {
  whatsappNumber: string;
  simStatus: SimStatusEnum;
  mobileNo: string | 'NA';
  simValidity: 'NA' | string;
  planExpireDate: 'NA' | string;
  startDate: 'NA' | string;
  unlimitedPlan: 'NA' | string;
  leftAirtime: 'NA' | string;
  action: Actions;
};
