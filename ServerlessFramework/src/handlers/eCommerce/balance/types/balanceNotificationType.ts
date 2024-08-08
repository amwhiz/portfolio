import { SimStatusEnum } from 'src/entities/enums/sim';

export type BalanceNotificationType = {
  simStatus: SimStatusEnum;
  mobileNo: string | 'NA';
  simValidity: string;
  usage: RemainingData[];
};

export type RemainingData = {
  type: string;
  data: string;
  coverage: 'Global';
  remainingValidity: string;
};
