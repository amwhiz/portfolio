import { Connection, EntityField, EntityManager, EntityRepository, FilterQuery, IDatabaseDriver, QueryOrder, wrap } from '@mikro-orm/core';
import { PostgreSqlDriver, SqlEntityManager } from '@mikro-orm/postgresql';
import { Dayjs } from 'dayjs';
import { LoggerService } from 'packages/aw-logger';
import { ormInstance } from 'src/configurations/mikroOrm';
import { SimPurchase } from 'src/entities';
import { Accounts } from 'src/entities/account';
import { Relationship } from 'src/entities/accountRelationship';
import { Role } from 'src/entities/enums/account';
import { RelationshipType } from 'src/entities/enums/accountRelationship';

export default class AccountService {
  private logger = new LoggerService({ serviceName: AccountService.name });
  private EntityManager: SqlEntityManager<PostgreSqlDriver> & EntityManager<IDatabaseDriver<Connection>>;
  private account: EntityRepository<Accounts> | undefined;
  private relationShip: EntityRepository<Relationship> | undefined;
  private simPurchase: EntityRepository<SimPurchase> | undefined;
  private initOrm = ormInstance;
  private publicFields: EntityField<Accounts, string>[] = ['hubspotUserId', 'id', 'name', 'email', 'role', 'currentPlan'];

  async ormInit(): Promise<void> {
    const orm = await this.initOrm.initialize();
    this.EntityManager = orm.em;
    this.account = this.EntityManager.getRepository(Accounts);
    this.relationShip = this.EntityManager.getRepository(Relationship);
    this.simPurchase = this.EntityManager.getRepository(SimPurchase);
    await this.delay(1000);
  }
  async closeConnection(): Promise<void> {
    await this.initOrm.closeConnection();
    await this.delay(2000);
  }

  async executeQuery<T>(query: string, params: (string | boolean | number | Dayjs)[]): Promise<T> {
    return await this.EntityManager.execute(query, params);
  }

  // Account
  async upsertAccount(account: Partial<Accounts>): Promise<Accounts> {
    try {
      const accountDocument = await this.account?.upsert(account, {
        upsert: true,
      });
      await this.EntityManager?.flush();
      return accountDocument;
    } catch (e) {
      this.logger.error('Something went wrong', {
        error: e,
      });
      return;
    }
  }

  async findAccountByUniqueColumn(email?: string, hubspotUserId?: string, referralCode?: string, id?: number): Promise<Accounts> {
    const orFilter = [];

    if (email) {
      orFilter.push({
        email,
      });
    }
    if (hubspotUserId) {
      orFilter.push({
        hubspotUserId,
      });
    }
    if (referralCode) {
      orFilter.push({
        referralCode,
      });
    }
    if (id) {
      orFilter.push({
        id,
      });
    }

    return (await this.account?.findOne({
      $or: orFilter,
    })) as Accounts;
  }

  async findAccountsByRole(role: Role, limit: number, offset: number): Promise<Accounts[] | []> {
    return (
      (await this.account?.find(
        { role },
        {
          fields: this.publicFields,
          limit,
          offset,
          orderBy: {
            createdAt: QueryOrder.DESC,
          },
        }
      )) ?? []
    );
  }

  // Account Relations
  async createRelations(parentAccount: Accounts, childAccount: Accounts, relationshipType: RelationshipType): Promise<void> {
    this.relationShip?.create({
      childAccountId: childAccount,
      parentAccountId: parentAccount,
      relationshipType,
    });
    await this.EntityManager?.flush();
  }

  async findRelationShipAccountsByParentAccount(
    parentAccount: Accounts,
    limit: number = 1000,
    offset: number = 0,
    relationShipType?: RelationshipType
  ): Promise<Relationship[]> {
    const findQuery: FilterQuery<Relationship> = {
      parentAccountId: parentAccount,
    };
    if (relationShipType) findQuery['relationshipType'] = relationShipType;

    return await this.relationShip?.find(findQuery, {
      limit,
      offset,
      populate: true,
    });
  }

  async findRelationShipAccountsByParentAccounts(parentAccount: Accounts): Promise<Relationship[]> {
    return (await this.relationShip?.find(
      {
        parentAccountId: parentAccount,
      },
      {
        orderBy: {
          createdAt: QueryOrder.DESC,
        },
        populate: true,
      }
    )) as Relationship[];
  }

  async findRelationShipAccountsByChildAccount(childAccount: Accounts): Promise<Relationship[]> {
    return (await this.relationShip?.find(
      {
        childAccountId: childAccount,
      },
      {
        orderBy: {
          createdAt: QueryOrder.DESC,
        },
        populate: true,
      }
    )) as Relationship[];
  }

  async findRelationShipAccountsByChildAccounts(childAccount: Accounts, RelationshipTypeType?: RelationshipType): Promise<Relationship[]> {
    return (await this.relationShip?.find(
      {
        childAccountId: childAccount,
        $or: [
          {
            relationshipType: RelationshipTypeType,
          },
        ],
      },
      {
        orderBy: {
          createdAt: QueryOrder.DESC,
        },
        populate: true,
      }
    )) as Relationship[];
  }

  async deleteRelationShipAccounts(parentAccount: Accounts, childAccount: Accounts): Promise<void> {
    await this.relationShip?.nativeDelete({
      parentAccountId: parentAccount,
      childAccountId: childAccount,
    });
    await this.EntityManager?.flush();
  }

  // Sim Purchase
  async createSimPurchase(simPurchase: Partial<SimPurchase>): Promise<Partial<SimPurchase>> {
    const simPurchaseDocument = await this.simPurchase?.create(simPurchase);
    await this.EntityManager?.flush();
    return simPurchaseDocument;
  }

  async updateSimPurchase(simPurchase: Partial<SimPurchase>, updateSimPurchase: Partial<SimPurchase>): Promise<Partial<SimPurchase>> {
    wrap(simPurchase).assign(updateSimPurchase, { merge: true });
    await this.EntityManager?.flush();
    return simPurchase;
  }

  async getSimPurchase(simPurchase: Partial<SimPurchase>): Promise<SimPurchase> {
    return await this.simPurchase?.findOne({ dealId: simPurchase.dealId });
  }

  async getSimPurchaseByAccount(account: Partial<Accounts>, limit: number, offset: number): Promise<SimPurchase[]> {
    return await this.simPurchase?.find(
      { accountId: account },
      {
        limit: limit,
        offset: offset,
        fields: ['dealId', 'status', 'purchasedAt', 'statusUpdatedAt', 'quantity'],
      }
    );
  }

  // close connection delay
  async delay(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
