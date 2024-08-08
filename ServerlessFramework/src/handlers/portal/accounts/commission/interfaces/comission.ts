import { Commissions } from 'src/entities';
import { CommissionRequest } from './commissionRequest';

export interface CommissionServiceBuilder {
  setDefaultProperties(payload: CommissionRequest): Promise<void>;
  findAccountRelationShips(): Promise<void>;
  getCommissionsByAccounts(): Promise<void>;
  groupByCreatedAt(): void;
  groupByAgency(): void;
  getCommissions(): FetchCommission[];
}

export interface ModifiedCommissionsByDate {
  date: string;
  data: Commissions[];
}

export interface CommissionSims {
  amount: number;
  agencyCommission: number;
  partnerCommission: number;
  customerName: string;
  isReferral: boolean;
  isUpgrade: boolean;
  isFreeSim: boolean;
}

export interface AgencyCommission {
  id: number;
  name: string;
  sims?: CommissionSims[];
  userAgent?: UserAgentCommission[];
}

export interface UserAgentCommission {
  id: number;
  name: string;
  sims: CommissionSims[];
}

export interface agencyModifiedCommission {
  agency: AgencyCommission;
}

export interface FetchCommission {
  date: string;
  data: {
    agency: AgencyCommission[];
  };
}
