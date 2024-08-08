import { Accounts } from 'src/entities';
import { Operation } from '../enums/operations';
import { Role } from 'src/entities/enums/account';
import { RelationshipType } from 'src/entities/enums/accountRelationship';

export interface UserManagement {
  getAgencies(account: Partial<Accounts>, limit: string, offset: string): Promise<Partial<Accounts>[]>;
  getUserAgents(account: Partial<Accounts>, limit: string, offset: string): Promise<Partial<Accounts>[]>;
  createRelationShip(parentAccount: Accounts, childAccount: Accounts, relationShipType: RelationshipType): Promise<void>;
  upsertAccount(account: Partial<Accounts>, role?: Role): Promise<Accounts>;
  createRoleBasedEntity(account: Partial<Accounts>, insertAccount: Partial<Accounts>, operation: Operation): Promise<string>;
}
