import { PartnerTerm } from './partnerTerm';

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IAccountBuilder {
  setDefaultProperties(): Promise<void>;
  upsertAccount(): Promise<void>;
}

export interface IActivationBuilder {
  setDefaultProperties(payload: any): Promise<void>;
  updateSim(): Promise<void>;
  updateDeal(): Promise<void>;
  updateDatabase(): Promise<void>;
}

export interface IAssociationBuilder {
  setDefaultProperties(): Promise<void>;
  setAssociation(): Promise<void>;
}

export interface ICdsBuilder {
  setDefaultProperties(payload: any): Promise<void>;
  updateDeal(): Promise<void>;
  updateSim(): Promise<void>;
}

export interface ICommissionBuilder {
  setDefaultProperties(payload: any): Promise<void>;
  updateDeal(): Promise<void>;
}

export interface IBuyBuilder {
  setDefaultProperties(payload: any): Promise<void>;
  upsetContact(): Promise<void>;
  createDeal(): Promise<void>;
  updateHubspotIds(): Promise<void>;
}

export interface IParcelNinjaBuilder {
  setDefaultProperties(payload: any): Promise<void>;
  updateDeal(): Promise<void>;
}

export interface IPaymentBuilder {
  setDefaultProperties(payload: any): Promise<void>;
  updateDeal(): Promise<void>;
  createSim(): Promise<void>;
  updateContact(): Promise<void>;
}

export interface ISimPurchaseBuilder {
  setDefaultProperties(payload: any): Promise<void>;
  createDeal(): Promise<void>;
}

export interface IRechargeBuilder {
  setDefaultProperties(payload: any): Promise<void>;
  updateSim(): Promise<void>;
  updateDeal(): Promise<void>;
}

export interface ISimPurchaseBuilder {
  setDefaultProperties(payload: any): Promise<void>;
  createDeal(): Promise<void>;
}

export interface IPartnerTermBuilder {
  setDefaultProperties(payload: PartnerTerm): Promise<void>;
  upsertDeal(): Promise<void>;
  updateBillingTransaction(): Promise<void>;
}
