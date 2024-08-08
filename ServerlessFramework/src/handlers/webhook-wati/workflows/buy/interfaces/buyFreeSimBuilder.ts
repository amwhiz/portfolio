/* eslint-disable @typescript-eslint/no-explicit-any */

export interface IBuyFreeSimBuilder {
  setDefaultProperties(payload: any): Promise<void>;
  createCustomer(): Promise<void>;
  createAddress(): Promise<void>;
  setProducts(): Promise<void>;
  createCheckout(): Promise<void>;
  createOrder(): Promise<void>;
  createLineItems(): Promise<void>;
  createSim(): Promise<void>;
  createSimPlans(): Promise<void>;
  instantsActivations(): Promise<void>;
}
