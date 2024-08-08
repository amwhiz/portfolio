/**
 * Accounts Entity
 * ---------------
 *
 * The Accounts entity represents user accounts in the system. It contains information about the user, such as
 * their HubSpot user ID, name, email, password, contact details, role, subscription plans, VAT number, region,
 * and account status. This entity is mapped to a corresponding database table and utilizes enums for roles and
 * subscription plans. It also extends the BaseEntity class provided by MikroORM to inherit common properties
 * such as the primary key, creation timestamp, and update timestamp.
 *
 * Properties:
 * - id: The primary key that uniquely identifies each user account.
 * - hubspotUserId: The unique identifier for the user's HubSpot account.
 * - name: The name of the user account.
 * - email: The email address associated with the user account.
 * - password: The password for the user account (should be securely hashed).
 * - otp: Optional one-time password for two-factor authentication.
 * - whatsapp: The WhatsApp number associated with the user account.
 * - referralCode: The referral code associated with the user account.
 * - role: The role of the user account (Partner, Agency, User Agent).
 * - currentPlan: The current subscription plan of the user account (optional).
 * - previousPlan: The previous subscription plan of the user account (optional).
 * - vatNumber: The VAT number associated with the user account.
 * - region: The region or location associated with the user account.
 * - commission: Optional commission percentage for the user account.
 * - registrationNumber: Optional registration number for the user account.
 * - partnerLevel: Optional partner level for the user account.
 * - marketSector: Optional market sector associated with the user account.
 * - isMarketing: A boolean flag indicating whether marketing is enabled for the user account (default: false).
 * - isBilling: A boolean flag indicating whether billing is enabled for the user account (default: false).
 * - lastInvoiceDate: The date of the last invoice for the user account (optional).
 * - isActive: A boolean flag indicating whether the user account is active (default: true).
 * - isSuspended: A boolean flag indicating whether the user account is suspended (default: false).
 * - suspendedAt: The date when the user account was suspended (optional).
 * - createdAt: The date and time when the user account was created.
 * - updatedAt: The date and time when the user account was last updated.
 *
 * Usage:
 * This entity is utilized for managing and tracking user accounts in the system. It stores essential user
 * information, including contact details, subscription plans, and account status. The entity's structure is
 * designed to ensure data integrity and provide flexibility for managing user accounts effectively.
 *
 * Note: The entity uses MikroORM decorators (@Entity, @PrimaryKey, @Property, @Enum) to define its structure
 * and relationships. Default values are provided for some properties to represent common initial states.
 */

import { Role, PlanType, ZONE } from './enums/account';
import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/core';

@Entity({ tableName: 'accounts' })
export class Accounts {
  @PrimaryKey({ autoincrement: true, type: 'bigint' })
  id!: number;

  @Property({ type: 'varchar', nullable: true, default: null })
  hubspotUserId!: string;

  @Property({ type: 'varchar', nullable: false })
  name!: string;

  @Property({
    type: 'varchar',
    nullable: false,
    unique: true,
    serializer(value: string) {
      return value.toLowerCase();
    },
  })
  email!: string;

  @Property({ type: 'varchar', nullable: false })
  password!: string;

  @Property({ nullable: true, type: 'int' })
  otp?: number;

  @Property({ type: 'varchar', nullable: true, default: null })
  whatsapp!: string;

  @Property({ type: 'varchar', nullable: true, default: null })
  referralCode!: string;

  @Enum({ items: () => Role, nullable: false, type: 'enum' })
  role!: Role;

  @Enum({ items: () => PlanType, nullable: true, type: 'enum', default: null })
  currentPlan?: PlanType;

  @Enum({ items: () => PlanType, nullable: true, type: 'enum', default: null })
  previousPlan?: PlanType;

  @Property({ type: 'datetime', nullable: true, default: null })
  lastPlanUpdatedAt?: Date;

  @Property({ type: 'varchar', nullable: true, default: null })
  vatNumber!: string;

  @Property({ type: 'text', nullable: true, default: null })
  address!: string;

  @Property({ type: 'varchar', nullable: true, default: null })
  region!: string;

  @Enum({ items: () => ZONE, type: 'enum', nullable: true, default: null })
  zone!: ZONE;

  @Property({
    type: 'float',
    default: 0,
    nullable: true,
    serializer(value: number) {
      return value ?? 0;
    },
  })
  commission?: number;

  @Property({ type: 'varchar', nullable: true, default: null })
  registrationNumber?: string;

  @Property({ type: 'varchar', nullable: true, default: null })
  partnerLevel?: string;

  @Property({ type: 'varchar', nullable: true, default: null })
  marketSector!: string;

  @Property({ type: 'boolean', nullable: true, default: false })
  isMarketing!: boolean;

  @Property({ type: 'boolean', nullable: true, default: false })
  isBilling!: boolean;

  @Property({ type: 'datetime', nullable: true, default: null })
  lastInvoiceDate?: Date = new Date();

  @Property({ type: 'boolean', nullable: false, default: true })
  isActive!: boolean;

  @Property({ type: 'datetime', default: null, nullable: true })
  lastLoginDate!: Date;

  @Property({ type: 'datetime', default: null, nullable: true })
  lastLogoutDate!: Date;

  @Property({ type: 'boolean', nullable: false, default: false })
  isSuspended!: boolean;

  @Property({ type: 'datetime', nullable: true, default: null })
  suspendedAt?: Date;

  @Property({ nullable: true, onCreate: () => new Date(), type: 'datetime' })
  createdAt?: Date = new Date();

  @Property({ nullable: true, onCreate: () => new Date(), onUpdate: () => new Date(), type: 'datetime' })
  updatedAt?: Date = new Date();

  @Property({ type: 'varchar', nullable: true, default: null })
  token?: string;

  @Property({ type: 'boolean', default: false, nullable: true })
  isInvoiceGenerated?: boolean;
}
