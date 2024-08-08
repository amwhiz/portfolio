import { Accounts } from 'src/entities/account';

export interface PartnerRelationship {
  agencies: Partial<Agencies>[];
}

export interface AgencyRelationShip {
  userAgents: Partial<Accounts>[];
}

export interface Agencies extends Accounts {
  userAgents: Partial<Accounts>[];
}

export interface AccountRelationShip extends Partial<Accounts> {
  agencies?: PartnerRelationship['agencies'];
  userAgents?: AgencyRelationShip['userAgents'];
}
