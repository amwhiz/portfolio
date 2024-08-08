import { CommissionRequest } from './commissionRequest';

export interface CommissionBuilder {
  setDefaultProperties(payload: CommissionRequest): Promise<void>;
  findAccountRelationShips(): Promise<void>;
  calculateCommission(): Promise<void>;
  createCommission(): Promise<void>;
}
