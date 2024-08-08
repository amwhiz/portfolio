import { Order, Sim, SimPlan } from 'src/entities';
import { DeliveryType } from '../interfaces/buySim';
import { CheckoutPayload } from '@handlers/checkout';

export type BuySimType = CheckoutPayload &
  Partial<{
    simId: Sim;
    simPlanPlan: SimPlan;
    simPlanAirtime: SimPlan;
    simPlanValidity: SimPlan;
    deliveryType: DeliveryType;
    isCollectionPoint: boolean;
    isDoorDelivery: boolean;
    orderId?: Order;
  }>;
