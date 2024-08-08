/* eslint-disable @typescript-eslint/no-explicit-any */

export interface IRechargeBuilder {
  setDefaultProperties(payload: any): Promise<void>;
  checkSimActive(): Promise<void>;
  setProducts(): Promise<void>;
  generatePaymentLink(): Promise<void>;
  createCheckout(): Promise<void>;
}
