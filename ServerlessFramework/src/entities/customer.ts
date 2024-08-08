/**
 * Customer Entity
 * ----------------
 *
 * The Customer entity represents individual customers in the system. It stores information about customer details
 * such as the first name, last name, email, WhatsApp contact, and the source of the customer.
 * This entity is mapped to a corresponding database table and extends the BaseEntity class provided by MikroORM.
 *
 * Properties:
 * - firstName: The first name of the customer.
 * - lastName: The last name of the customer.
 * - email: The email address of the customer.
 * - whatsapp: The WhatsApp contact number of the customer.
 * - source: An enumeration representing the source of the customer (default: unknown).
 *
 * Usage:
 * This entity is utilized for managing and tracking information related to individual customers. It plays a crucial
 * role in handling customer-specific details, contact information, and the source from which the customer originated.
 *
 * Note: The entity uses MikroORM decorators (@Entity, @Property, @Enum) to define its structure. Default values are
 * provided for some properties to represent common initial states.
 */

import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { SourceEnum } from './enums/customer';
import { Accounts } from './account';

@Entity({ tableName: 'customers' })
export class Customer {
  @PrimaryKey({ type: 'bigint', autoincrement: true })
  id!: number;

  @ManyToOne(() => Accounts, { name: 'accountId', nullable: true, default: null })
  accountId!: Accounts;

  @Property({ nullable: true, onCreate: () => new Date(), type: 'datetime' })
  createdAt?: Date;

  @Property({ nullable: true, onCreate: () => new Date(), onUpdate: () => new Date(), type: 'datetime' })
  updatedAt?: Date;

  @Property({ type: 'string' })
  firstName!: string;

  @Property({ type: 'string' })
  lastName!: string;

  @Property({
    type: 'string',
    unique: true,
    serializer(value: string) {
      return value.toLowerCase();
    },
  })
  email!: string;

  @Property({ type: 'string', nullable: true, default: null })
  whatsapp!: string;

  @Enum({ items: () => SourceEnum, default: `${[SourceEnum.Unknown]}`, type: 'enum' })
  source!: SourceEnum;

  // If they misuse the system.
  @Property({ type: 'boolean', nullable: true, default: false })
  is_misused: boolean;

  @Property({ type: 'datetime', nullable: true, default: null })
  misused_at!: Date;

  @Property({ type: 'string', nullable: true, default: null })
  referralCode!: string;
}
