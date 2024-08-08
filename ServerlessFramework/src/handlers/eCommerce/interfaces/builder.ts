/* eslint-disable @typescript-eslint/no-explicit-any */

export interface IEcommerceBuilder {
  setDefaultProperties(payload: any): Promise<void>;
  createCustomer(): Promise<void>;
  createCustomerReferral(): Promise<void>;
  createAddress(): Promise<void>;
  setProducts(): Promise<void>;
  createCheckout(): Promise<void>;
  createOrder(): Promise<void>;
  createLineItems(): Promise<void>;
  createSim(): Promise<void>;
  createSimPlans(): Promise<void>;
}

export interface RechargeBuilder {
  setDefaultProperties(payload: any): Promise<void>;
  createOrder(): Promise<void>;
  createLineItems(): Promise<void>;
  upsetSimPlan(): Promise<void>;
  rechargeProcess(): Promise<void>;
  updateCustomerReferral(): Promise<void>;
}
