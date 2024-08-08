/**
 * SimPurchase Entity
 * -----------
 *
 * The Sim Purchase entity represents SIM cards or similar entities in the system. It stores information about
 * SIM card details, including customer association, serial number, mobile number, SIM type, status,
 * and various activation-related codes and timestamps. This entity is mapped to a corresponding database
 * table and extends the BaseEntity class provided by MikroORM.
 *
 * Properties:
 * - accountId: Many-to-One relationship with the Account entity, representing the associated account.
 * - status: An enumeration representing the status of the SIM card (e.g., active, inactive).
 * - purchasedAt: An optional identifier for the type of  date and time when the SIM card was purchased.
 * - statusUpdatedAt: An optional identifier for the type of  date and time when the SIM card was purchased.
 * - quantity: An optional identifier for the no.of SIM card was purchased.
 *
 * Relationships:
 * - Account has a many-to-one relationship with the Account entity via the accountId property.
 *
 * Usage:
 * This entity is utilized for managing and tracking information related to SIM cards. It includes details
 * such as customer association, activation information, and status. The entity serves as the foundation for
 * handling SIM purchase-related operations and tracking their lifecycle in the application.
 *
 * Note: The entity uses MikroORM decorators (@Entity, @ManyToOne, @Property, @Enum) to define its structure
 * and relationships. There is a possible typo in the property name qrCodeImag3, which may need correction.
 */

import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Accounts } from './account';
import { SimPurchaseStatus } from './enums/simPurchase';

@Entity({ tableName: 'simPurchases' })
export class SimPurchase {
  @PrimaryKey({ type: 'bigint', autoincrement: true })
  id!: number;

  @Property({ nullable: true, onCreate: () => new Date(), type: 'datetime' })
  createdAt?: Date;

  @Property({ nullable: true, onCreate: () => new Date(), onUpdate: () => new Date(), type: 'datetime' })
  updatedAt?: Date;

  @ManyToOne(() => Accounts, { name: 'accountId' })
  accountId!: Accounts;

  @Enum({ items: () => SimPurchaseStatus, type: 'enum', default: SimPurchaseStatus['orderPlaced'] })
  status!: SimPurchaseStatus;

  @Property({ type: 'datetime', nullable: true, default: null })
  purchasedAt!: Date;

  @Property({ type: 'datetime', nullable: true, default: null })
  statusUpdatedAt!: Date;

  @Property({ type: 'number', nullable: true, default: 0 })
  quantity!: number;

  @Property({ type: 'string', nullable: true, default: null })
  dealId!: string;
}
