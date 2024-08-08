import { PlanType } from 'src/entities/enums/account';

export type PartnerTermUpdateType = {
  currentPlan: PlanType;
  email: string;
};
