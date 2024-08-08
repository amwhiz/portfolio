/* eslint-disable @typescript-eslint/no-explicit-any */

export interface IBuyBuilder {
  setDefaultProperties(payload: any): Promise<void>;
  createCustomer(): Promise<void>;
  createAddress(): Promise<void>;
  setProducts(): Promise<void>;
  generatePaymentLink(): Promise<void>;
  createCheckout(): Promise<void>;
}

export interface IBuyPartnerBuilder {
  setDefaultProperties(payload: any): Promise<void>;
  setProducts(): Promise<void>;
  generatePaymentLink(): Promise<void>;
  updateCheckout(): Promise<void>;
  createOrders(): Promise<void>;
}
