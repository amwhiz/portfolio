/* eslint-disable @typescript-eslint/no-explicit-any */

import { Accounts } from 'src/entities';
import { BuySimType } from '../types/buySim';
import { CheckoutPayload } from '@handlers/checkout';
import { FormTypes } from '../enums/forms';

export interface BuyBuilder {
  setDefaultProperties(payload: any, account: Accounts): Promise<void>;
  createCustomer(): Promise<void>;
  createAddress(): Promise<void>;
  setProducts(): Promise<void>;
  createCheckout(): Promise<void>;
  returnPayload(): CheckoutPayload;
}

export interface BuySimBuilder {
  setDefaultProperties(payload: BuySimType, formType?: FormTypes): Promise<void>;
  sendWatiNotification(): Promise<void>;
}

export interface CompleteSimBuilder {
  setDefaultProperties(payload: BuySimType): Promise<void>;
  createOrder(): Promise<void>;
  instantsActivations(): Promise<void>;
}

export interface RechargeBuilder {
  setDefaultProperties(payload: BuySimType): Promise<void>;
  createOrder(): Promise<void>;
  createLineItems(): Promise<void>;
  upsetSimPlan(): Promise<void>;
  rechargeProcess(): Promise<void>;
}
