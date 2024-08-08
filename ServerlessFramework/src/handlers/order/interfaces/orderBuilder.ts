/* eslint-disable @typescript-eslint/no-explicit-any */
import { OrderSim } from '../order';

export interface IOrderBuilder {
  setDefaultProperties(payload: OrderSim): Promise<void>;
  createOrder(): Promise<void>;
  createLineItems(): Promise<void>;
  createSim(): Promise<void>;
  createSimPlans(): Promise<void>;
  returnPayload(): OrderSim;
}
