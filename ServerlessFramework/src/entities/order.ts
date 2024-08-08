/**
 * Order Entity
 * -------------
 *
 * The Order entity represents customer orders in the system. It contains information about order details
 * such as the associated customer, total price, countries involved in the order, referral code, transaction
 * identifiers, SIM card details, order date, and device type. This entity is mapped to a corresponding database
 * table and extends the BaseEntity class provided by MikroORM.
 *
 * Properties:
 * - customerId: Many-to-One relationship with the Customer entity, representing the customer who placed the order.
 * - simId: Many-to-One relationship with the Sim entity, representing the customer who placed the order.
 * - totalPrice: The total price of the order.
 * - countryTravelTo: The country to which the order pertains.
 * - countryFrom: The country from which the order originates.
 * - merchantTransactionId: The unique identifier for the merchant's transaction related to the order.
 * - simType: An enumeration representing the type of SIM card associated with the order.
 * - orderDate: The date and time when the order was placed.
 * - accountId: Many-to-One relationship with the Account entity, representing the associated account.
 *
 * Relationships:
 * - Order has a many-to-one relationship with the Customer entity via the customerId property.
 * - Account has a many-to-one relationship with the Account entity via the accountId property.
 *
 * Usage:
 * This entity is utilized for managing and tracking customer orders in the system. It plays a crucial role in
 * handling order-specific details, customer associations, and transaction information in the application.
 *
 * Note: The entity uses MikroORM decorators (@Entity, @ManyToOne, @Property, @Enum) to define its structure
 * and relationships.
 */

import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Customer } from './customer';
import { Sim } from './sim';
import { OrderType } from './enums/order';
import { Accounts } from './account';
import { SourceEnum } from './enums/customer';

@Entity({ tableName: 'orders' })
export class Order {
  @PrimaryKey({ type: 'bigint', autoincrement: true })
  id!: number;

  @Property({ nullable: true, onCreate: () => new Date(), type: 'datetime' })
  createdAt?: Date;

  @Property({ nullable: true, onCreate: () => new Date(), onUpdate: () => new Date(), type: 'datetime' })
  updatedAt?: Date;

  @ManyToOne(() => Customer, { name: 'customerId' })
  customerId!: Customer;

  @Property({ type: 'float', default: 0 })
  totalPrice!: number;

  @Property({ type: 'string', default: null, nullable: true })
  countryTravelTo!: string;

  @Property({ type: 'string', default: null, nullable: true })
  countryFrom!: string;

  @Property({ default: null, nullable: true, type: 'string' })
  merchantTransactionId!: string;

  @Property({ type: 'datetime' })
  orderDate!: Date;

  @Enum({ items: () => OrderType, type: 'enum', nullable: true, default: null })
  type!: OrderType;

  @ManyToOne(() => Sim, { name: 'simId', nullable: true, default: null })
  simId!: Sim;

  @ManyToOne(() => Accounts, { name: 'accountId', nullable: true, default: null })
  accountId!: Accounts;

  @Enum({ items: () => SourceEnum, default: SourceEnum.Unknown, type: 'enum' })
  source: SourceEnum;
}
