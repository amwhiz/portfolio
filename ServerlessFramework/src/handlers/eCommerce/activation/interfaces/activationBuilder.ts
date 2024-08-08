/* eslint-disable @typescript-eslint/no-explicit-any */

import { ActivationResponseType } from '../types/activation';

export interface IActivationBuilder {
  setDefaultProperties(payload: any): Promise<void>;
  activateExecutiveSim(): Promise<ActivationResponseType>;
}
