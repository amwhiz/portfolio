import { Checkout, SimPlan } from 'src/entities';
import { SimType } from 'src/entities/enums/common';
import { SimStatusEnum } from 'src/entities/enums/sim';
import { Actions } from 'src/enums/actions';

export interface ActivationExecutiveRequest {
  selectedPlanPosition?: string;
  email: string;
  simType?: SimType;
  planStartDate?: string; // From activation workflow
  serialNumber?: string;
  whatsappNumber?: string;
  simPlanPlan?: SimPlan; // From activation workflow
  plan?: string;
  action?: Actions;
  buttons?: string[];
  device?: string;
  shipmentDetails?: string;
  checkoutId?: Checkout;
  flowName?: string;
  simId?: number;
}

export interface Activated {
  qrCode: string;
  smtps: string;
  activationCode: string;
  mobileNo: string;
  status: SimStatusEnum;
  activatedAt: Date;
  qrImageUrl: string;
  serialNumber: string;
}
