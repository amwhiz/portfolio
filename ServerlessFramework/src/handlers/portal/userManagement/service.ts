import { Accounts } from 'src/entities';
import AccountService from '@handlers/account/account';
import { Role } from 'src/entities/enums/account';
import { AppError } from '@libs/api-error';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { WorkflowBase } from '@handlers/webhook-wati/workflows/pushToQueue';
import { env, KeyType } from '@aw/env';
import { UserManagement } from './interfaces/userManagement';
import { SQSTypes } from 'src/constants/sqs';
import { RelationshipType } from 'src/entities/enums/accountRelationship';
import * as bcrypt from 'bcryptjs';
import { generateRandPassword } from 'src/helpers/generateRandPassword';
import { getReferralCode } from 'src/helpers/getReferralCode';
import { Operation } from './enums/operations';
import { deleteProperties } from 'src/helpers/deleteProperties';
import { omitProperties } from '../constants/protectedProperties';
import { CRMWorkFlow } from 'src/enums/workflows';
import { url } from '../constants/url';
import { Actions } from 'src/enums/actions';

export const CRMType = { Association: 'Association', Create: 'Create' };

export class UserManagementService extends WorkflowBase implements UserManagement {
  private accountService: AccountService;
  private crmQueue: KeyType = SQSTypes.crm;
  private notificationSQS: KeyType = SQSTypes.emailNotification;

  constructor() {
    super();
    this.accountService = new AccountService();
  }

  async getAgencies(account: Partial<Accounts>, limit: string, offset: string): Promise<Partial<Accounts>[]> {
    await this.accountService.ormInit();
    const accountDocument = await this.accountService.findAccountByUniqueColumn(account.email);

    const relationType = {
      [Role.AGENCY as string]: RelationshipType.AGENCY_TO_USER,
      [Role.PARTNER as string]: RelationshipType.PARTNER_TO_AGENCY,
    };

    const agencies = await this.accountService.findRelationShipAccountsByParentAccount(
      accountDocument,
      +limit,
      +offset - 1,
      relationType[account?.role as Role]
    );

    const filteredAgency: Partial<Accounts>[] = [];
    for (const agency of agencies) {
      if (agency.parentAccountId?.role === Role.AGENCY) {
        filteredAgency.push(deleteProperties(agency.parentAccountId, omitProperties) as Partial<Accounts>);
      } else if (agency.parentAccountId?.role === Role.PARTNER) {
        filteredAgency.push(deleteProperties(agency.childAccountId, omitProperties) as Partial<Accounts>);
      }
    }

    return filteredAgency;
  }

  async getUserAgents(account: Partial<Accounts>, limit: string, offset: string): Promise<Partial<Accounts>[]> {
    await this.accountService.ormInit();
    const accountDocument = await this.accountService.findAccountByUniqueColumn(account.email);
    const userAgents = await this.accountService.findRelationShipAccountsByParentAccount(accountDocument, +limit, +offset - 1);

    const filteredUserAgent: Partial<Accounts>[] = [];
    for (const userAgent of userAgents) {
      if (userAgent.childAccountId?.role === Role.USER_AGENT) {
        filteredUserAgent.push(deleteProperties(userAgent.childAccountId, omitProperties) as Partial<Accounts>);
      }
    }

    return filteredUserAgent;
  }

  async deleteRelationShip(parentAccount: Accounts, childAccount: Accounts): Promise<void> {
    await this.accountService.deleteRelationShipAccounts(parentAccount, childAccount);
    await this.queue(this.crmQueue, {
      parentAccount: parentAccount,
      childAccount: childAccount,
      flowName: CRMWorkFlow.Association,
      type: Operation.DELETE,
    });
  }

  async createRelationShip(parentAccount: Accounts, childAccount: Accounts, relationShipType: RelationshipType): Promise<void> {
    await this.accountService.createRelations(parentAccount, childAccount, relationShipType);
    await this.queue(this.crmQueue, {
      parentAccount: parentAccount,
      childAccount: childAccount,
      flowName: CRMWorkFlow.Association,
      type: Operation.CREATE,
    });
  }

  private getRoleBasedName(role: Role, account: Partial<Accounts>): string {
    const roleBasedUserName = {
      [Role['PARTNER']]: `Partner Name: ${account.name}`,
      [Role['AGENCY']]: `Agency Name: ${account.name}`,
      [Role['USER_AGENT']]: `Agent Name: ${account.name}`,
    };
    return roleBasedUserName[role];
  }

  async upsertAccount(
    account: Partial<
      Accounts & {
        accountsDivisionContacts2Nd?: string;
        accountsDivisionContacts?: string;
        numberOfBranches?: number;
        numberOfUsers?: number;
        itDivisionContact?: string;
      }
    >,
    role?: Role
  ): Promise<Accounts> {
    let mergedAccount: Partial<Accounts>;
    const isAccountExists = await this.accountService.findAccountByUniqueColumn(account.email);
    if (isAccountExists?.email) {
      mergedAccount = { ...isAccountExists, ...account };
    } else {
      mergedAccount = { ...account };
      const randPassword = generateRandPassword();
      const hashPassword = await bcrypt.hash(randPassword, 10);

      mergedAccount.name = account?.email?.split('@')[0];
      mergedAccount.role = role;

      mergedAccount.password = hashPassword;
      mergedAccount.referralCode = getReferralCode();

      await this.queue(this.notificationSQS, {
        ...mergedAccount,
        userPassword: randPassword,
        domain: env('stage') === 'dev' ? url.devPartnerDomain : url.prodPartnerDomain,
        userName: this.getRoleBasedName(mergedAccount.role, mergedAccount),
        templateName: 'accountActivation',
        action: Actions.Email,
      });
    }

    const accountDocument = await this.accountService.upsertAccount(
      deleteProperties(mergedAccount, [
        'accountsDivisionContacts',
        'accountsDivisionContacts2Nd',
        'numberOfBranches',
        'numberOfUsers',
        'itDivisionContact',
      ])
    );
    await this.queue(this.crmQueue, {
      account: accountDocument,
      accountsDivisionContacts: account?.accountsDivisionContacts,
      accountsDivisionContacts2Nd: account?.accountsDivisionContacts2Nd,
      numberOfBranches: account?.numberOfBranches,
      numberOfUsers: account?.numberOfUsers,
      itDivisionContact: account?.itDivisionContact,
      flowName: CRMWorkFlow.Account,
    });
    return accountDocument;
  }

  async validateAccount(accountDocument: Accounts, insertAccount: Partial<Accounts> & { agency?: string }, operation: Operation): Promise<void> {
    const isUpsertAccountExists = await this.accountService.findAccountByUniqueColumn(insertAccount?.email);

    if (isUpsertAccountExists && Operation.CREATE === operation) throw new AppError('The email address is already in use.', StatusCodes.CONFLICT);

    if (accountDocument.role === Role.USER_AGENT) throw new AppError(ReasonPhrases.FORBIDDEN, StatusCodes.FORBIDDEN);
    if (!accountDocument?.email) throw new AppError(ReasonPhrases.NOT_FOUND, StatusCodes.NOT_FOUND);
  }

  async createRoleBasedEntity(
    account: Partial<Accounts>,
    insertAccount: Partial<Accounts> & { agency?: string },
    operation: Operation
  ): Promise<string> {
    await this.accountService.ormInit();
    const accountDocument = await this.accountService.findAccountByUniqueColumn(account.email);
    const isUserAgent = !!insertAccount?.agency; // Check is create userAgent or not

    await this.validateAccount(accountDocument, insertAccount, operation);
    insertAccount.zone = account?.zone;

    if (operation === Operation.CREATE) {
      if (isUserAgent) {
        const agency = await this.accountService.findAccountByUniqueColumn(insertAccount?.agency);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (insertAccount as any).agency;
        insertAccount.zone = agency?.zone;
        const account = await this.upsertAccount(insertAccount, Role.USER_AGENT);
        if (accountDocument.role === Role.PARTNER) await this.createRelationShip(accountDocument, account, RelationshipType.PARTNER_TO_USER); // Partner to Agency
        await this.createRelationShip(agency, account, RelationshipType.AGENCY_TO_USER); // Agency to UserAgent
        await this.accountService.closeConnection();
        return ReasonPhrases.OK;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (insertAccount as any).agency;
      insertAccount.zone = accountDocument?.zone;
      const account = await this.upsertAccount(insertAccount, Role.AGENCY);
      const relations = accountDocument.role === Role.PARTNER ? RelationshipType.PARTNER_TO_AGENCY : RelationshipType.AGENCY_TO_USER;
      await this.createRelationShip(accountDocument, account, relations);
      await this.accountService.closeConnection();
      return ReasonPhrases.OK;
    }

    if (operation === Operation.UPDATE) {
      const account = await this.accountService.findAccountByUniqueColumn(insertAccount?.email);
      await this.upsertAccount({ ...account, ...insertAccount });
      await this.accountService.closeConnection();
      return ReasonPhrases.OK;
    }

    if (operation === Operation.DELETE) {
      const userAgent = await this.accountService.findAccountByUniqueColumn(insertAccount?.email);
      if (isUserAgent) {
        const agency = await this.accountService.findAccountByUniqueColumn(insertAccount?.agency);
        if (accountDocument.role === Role.PARTNER) await this.deleteRelationShip(accountDocument, userAgent);
        await this.deleteRelationShip(agency, userAgent);
        await this.accountService.closeConnection();
        return ReasonPhrases.OK;
      }
      await this.deleteRelationShip(accountDocument, userAgent);
      return ReasonPhrases.OK;
    }
    await this.accountService.closeConnection();
    return ReasonPhrases.OK;
  }

  async queue(queueName: KeyType, payload: object = {}): Promise<void> {
    await super.pushToQueue(queueName, payload);
    await super.delay(2000);
  }
}
