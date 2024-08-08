/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ILocationBuilder {
  setDefaultProperties(): Promise<void>;
  updateLocation(): Promise<void>;
  checkDelivery(): Promise<void>;
}
