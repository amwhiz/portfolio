import 'reflect-metadata';
import { PostgreSqlDriver, Options } from '@mikro-orm/postgresql';
import {
  Address,
  Checkout,
  Customer,
  LineItem,
  Order,
  Product,
  ProductsVariant,
  Sim,
  SimActivity,
  SimPlan,
  Template,
  Accounts,
  Relationship,
  SimPurchase,
  BillingTransactions,
  Configuration,
  AuditLogs,
  CommissionConfiguration,
  Commissions,
} from './entities';
import { EntityCaseNamingStrategy, ReflectMetadataProvider } from '@mikro-orm/core';
import { env } from '@aw/env';
import { CustomerReferral } from './entities/customerReferral';
import { EcommerceProductsVariant } from './entities/eCommerceProductVariant';

export const config: Options = {
  driver: PostgreSqlDriver,
  type: 'postgresql',
  dbName: env('dataBaseName'),
  user: env('dataBaseUser'),
  password: env('dataBasePassword'),
  host: env('dataBaseHost'),
  port: +env('dataBasePort'),
  entities: [
    Address,
    Checkout,
    Customer,
    Sim,
    SimActivity,
    SimPlan,
    Product,
    ProductsVariant,
    LineItem,
    Order,
    Template,
    Configuration,
    Accounts,
    Relationship,
    SimPurchase,
    BillingTransactions,
    AuditLogs,
    CommissionConfiguration,
    Commissions,
    CustomerReferral,
    EcommerceProductsVariant,
  ],
  debug: (env('stage') || 'dev') !== 'prod',
  ignoreUndefinedInQuery: true,
  metadataProvider: ReflectMetadataProvider,
  namingStrategy: EntityCaseNamingStrategy,
  allowGlobalContext: true,
  driverOptions: {
    connection: { ssl: { rejectUnauthorized: false } },
  },
  flushMode: 1,
};

export default config;
