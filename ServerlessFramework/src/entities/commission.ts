import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { Sim } from './sim';
import { Accounts } from './account';
import { Order } from './order';

@Entity({ tableName: 'commissions' })
export class Commissions {
  @PrimaryKey({ type: 'bigint', autoincrement: true })
  id!: number;

  @ManyToOne(() => Order, { name: 'orderId' })
  orderId!: Order;

  @ManyToOne(() => Sim, { name: 'simId', nullable: true, default: null })
  simId!: Sim;

  @ManyToOne(() => Accounts, { name: 'agencyId' })
  agencyId!: Accounts;

  @Property({ type: 'int', default: 0 })
  amount: number;

  @ManyToOne(() => Accounts, { nullable: true, name: 'partnerId' })
  partnerId?: Accounts;

  @Property({ type: 'float', nullable: true })
  partnerCommissionAmount?: number;

  @Property({ type: 'float' })
  agencyPercentage!: number;

  @Property({ type: 'float' })
  agencyCommissionAmount!: number;

  @Property({ type: 'float', nullable: true })
  partnerPercentage?: number;

  @Property({ type: 'datetime' })
  createdAt: Date = new Date();

  @Property({ type: 'datetime', onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
