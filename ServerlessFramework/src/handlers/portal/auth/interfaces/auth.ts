import { Accounts } from 'src/entities/account';
import { AccountRelationShip } from './account';

export interface Auth {
  register(account: Partial<Accounts>): Promise<void>;
  me(account: Partial<Accounts>): Promise<AccountRelationShip>;
  login(account: Partial<Accounts>): Promise<Partial<Accounts>>;
  resetPassword(account: Partial<Accounts & { newPassword: string }>): Promise<string>;
  updateAccount(account: Partial<Accounts>): Promise<Partial<Accounts>>;
  logout(account: Partial<Accounts>): Promise<void>;
}
