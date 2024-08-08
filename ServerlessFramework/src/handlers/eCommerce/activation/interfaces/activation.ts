import { Checkout, Sim, SimPlan } from 'src/entities';
import { SimStatusEnum } from 'src/entities/enums/sim';

export interface ActivationExecutiveRequest {
  email: string;
  whatsappNumber?: string;
  simPlanPlan?: SimPlan; // From activation workflow
  plan?: string;
  checkoutId?: Checkout;
  flowName?: string;
  simId?: Sim;
  country?: string;
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
