/* eslint-disable @typescript-eslint/no-explicit-any */

export interface IActivationBuilder {
  setDefaultProperties(payload: any): Promise<void>;
  checkoutCustomerPaid(): Promise<void>;
  activateExecutiveSim(): Promise<void>;
}
