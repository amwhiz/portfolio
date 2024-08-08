import { ProductVariantSkuEnum } from 'src/entities/enums/productVariant';

type pipeLine = {
  id: number;
};

type shopifyPipeLine = pipeLine & {
  stages: Pick<PipelineStages, 'open' | 'completed' | 'pending' | 'closedWon'>;
};

type watiPipeLine = pipeLine & {
  stages: Pick<PipelineStages, 'open' | 'completed' | 'expired' | 'cancelled' | 'initiated' | 'activation' | 'parcel' | 'pending'>;
};

type orderPipeLine = pipeLine & {
  stages: Pick<PipelineStages, 'orderPlaced' | 'receivedByNtc' | 'dispatch' | 'decisionMakerBoughtIn' | 'receivedAtPartner'>;
};

type simPipeLine = pipeLine & {
  stages: Pick<
    PipelineStages,
    'bulk' | 'single' | 'free' | 'activated' | 'paymentReceived' | 'expired' | 'cancelled' | 'completed' | 'initiated' | 'pending' | 'parcel'
  >;
};

type existsSimPipeLine = pipeLine & {
  stages: Pick<PipelineStages, 'new' | 'pending' | 'activation'>;
};

type billingPipeLine = pipeLine & {
  stages: Pick<PipelineStages, 'open' | 'inContact' | 'completed' | 'expired'>;
};

export type Configurations = {
  partnerFlows: string[];
  freeSimActivationFlow: string[];
  freeSimNotActivationFlow: string[];
  hubspotOrderStages: StageDescriptions;
  hubspotIds: HubspotIds;
  supportSourceMail: string[];
  sourcesMails: string[];
  peachToken: string;
  zeptoMailBaseUri: string;
  nodeMailerHost: string;
  nodeMailerAuthUser: string;
  fromAddress: string;
  senderName: string;
  bccAddress1: string;
  bccAddress2: string;
  bccAddress3: string;
  bccAddress4: string;
  shopifyVariants: ShopifyVariants;
  countryCodes: Location[];
  ntcTeamEmail: string[];
  ntcTeamWhatsapp: string[];
  indiaUserID: string;
  europeUserID: string;
  rowUserID: string;
  ukUserID: string;
};

export type configures = {
  partnerFlows: string;
  freeSimActivationFlow: string;
  freeSimNotActivationFlow: string;
  hubspotOrderStages: string;
  hubspotIds: string;
  supportSourceMail: string;
  sourcesMails: string;
  peachToken: string;
  zeptoMailBaseUri: string;
  nodeMailerHost: string;
  nodeMailerAuthUser: string;
  fromAddress: string;
  senderName: string;
  bccAddress1: string;
  bccAddress2: string;
  bccAddress3: string;
  bccAddress4: string;
  shopifyVariants: string;
  countryCodes: string;
  ntcTeamEmail: string[];
  ntcTeamWhatsapp: string[];
  indiaUserID: string;
  europeUserID: string;
  rowUserID: string;
  ukUserID: string;
};

type PipelineStages = {
  open: number;
  completed: number;
  expired: number;
  cancelled: number;
  initiated: number;
  activation: number;
  parcel: number;
  pending: number;
  qualifiedToBuy: number;
  presentationScheduled: number;
  decisionMakerBoughtIn: number;
  contractSent: number;
  closedWon: number;
  orderPlaced: number;
  receivedByNtc: number;
  new: number;
  inContact: number;
  dispatch: number;
  receivedAtPartner: number;
  bulk: number;
  single: number;
  free: number;
  activated: number;
  paymentReceived: number;
};

type Pipelines = {
  wati: watiPipeLine;
  order: orderPipeLine;
  sim: simPipeLine;
  existsSIM: existsSimPipeLine;
  ticket: existsSimPipeLine;
  billing: billingPipeLine;
  shopify: shopifyPipeLine;
};

export type HubspotIds = {
  Agency_ObjectTypeId: number;
  Partner_ObjectTypeId: number;
  userAgent_objectTypeId: number;
  Sim_ObjectTypeId: number;
  Deal_ObjectTypeId: number;
  Pipelines: Pipelines;
  Deal_to_UserAgent: number;
  Deal_to_SIM: number;
  Deal_to_Contact: number;
  Deal_to_Agency: number;
  Deal_to_lineItem: number;
  Contact_to_partners: number;
  Agencies_to_contact: number;
  Sims_to_contact: number;
  Agency_to_partner: number;
  Agency_to_userAgent: number;
  Sims_to_deal: number;
  sim: string;
  partner: string;
  agency: string;
  userAgent: string;
};

export type StageDescriptions = {
  [stageId: string]: string;
};

export type ShopifyVariants = {
  [stageId: string]: {
    plan: ProductVariantSkuEnum;
    airtime: ProductVariantSkuEnum;
  };
};

export type Location = {
  Country: string;
  MCC: number;
};
