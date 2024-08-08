/**
 * Billing Transaction Entity
 * -----------------
 *
 * The Billing Transaction entity represents a transactional process within the system, typically involving the purchase
 * of products or services. It contains information about the associated account, invoice details, payment status,
 * amount, completion status, and relevant timestamps. This entity is mapped to a corresponding database table and
 * extends the BaseEntity class provided by MikroORM.
 *
 * Properties:
 * - id: Primary key for identifying each checkout transaction.
 * - createdAt: The timestamp indicating the creation date of the checkout (automatically generated on creation).
 * - updatedAt: The timestamp indicating the last update date of the checkout (automatically updated on modification).
 * - account: Many-to-One relationship with the Account entity, representing the associated account.
 * - invoice: The invoice details associated with the checkout (nullable).
 * - paymentStatus: Enum representing the payment status of the checkout.
 * - paymentLink: The link associated with the payment process (nullable).
 * - isExpired: Boolean flag indicating whether the checkout has expired (nullable).
 * - amount: The total amount of the checkout transaction (nullable).
 * - isPaid: Boolean flag indicating whether the checkout has been paid.
 * - paidAt: The timestamp indicating when the checkout was paid (nullable).
 * - weekStartDate: The start date of the week associated with the checkout (nullable).
 * - weekEndDate: The end date of the week associated with the checkout (nullable).
 * - hubDealId: The identifier associated with any deals related to the checkout (nullable).
 * - paymentDueDate: The due date for payment of the checkout (nullable).
 * - currentPlan: The current subscription plan of the user account (optional).
 *
 * Lifecycle Hooks:
 * - BeforeUpdate: The `updateCheckoutProperties` method is called before updating the checkout. It automatically sets
 *   the completion and payment timestamps when the checkout is paid.
 *
 * Relationships:
 *
 * Usage:
 * This entity is used to manage and track transactions within the system. It provides essential information about
 * each checkout process, including payment status, associated account, and relevant timestamps. Additionally, it
 * facilitates the handling of payment-related actions and maintains consistency throughout the checkout lifecycle.
 *
 * Note: The entity utilizes MikroORM decorators (@Entity, @ManyToOne, @Property, @BeforeUpdate) to define its structure,
 * relationships, and lifecycle hooks.
 */

import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { PaymentTypes } from '@handlers/payments/enums/paymentStatus';
import { Accounts } from './account';
import { PlanType } from './enums/account';

@Entity({ tableName: 'billingTransactions' })
export class BillingTransactions {
  @PrimaryKey({ type: 'bigint', autoincrement: true })
  id!: number;

  @Property({ nullable: true, onCreate: () => new Date(), type: 'datetime' })
  createdAt?: Date;

  @Property({ nullable: true, onCreate: () => new Date(), onUpdate: () => new Date(), type: 'datetime' })
  updatedAt?: Date;

  @ManyToOne(() => Accounts, { fieldName: 'accountId' })
  account!: Accounts;

  @Property({ type: 'string', nullable: false, unique: true })
  invoice?: string;

  @Enum({ items: () => PaymentTypes, default: PaymentTypes.initiated, type: 'enum' })
  paymentStatus?: PaymentTypes;

  @Property({ type: 'text', nullable: false })
  paymentLink?: string;

  @Property({ type: 'boolean', nullable: false, default: false })
  isExpired?: boolean;

  @Property({ type: 'float', nullable: true })
  amount?: number;

  @Property({ type: 'boolean', nullable: false, default: false })
  isPaid?: boolean;

  @Property({ type: 'datetime', nullable: true, default: null })
  paidAt?: Date;

  @Property({ type: 'string', nullable: true, default: null })
  weekStartDate?: string;

  @Property({ type: 'string', nullable: true, default: null })
  weekEndDate?: string;

  @Property({ type: 'string', nullable: true, default: null })
  dealId?: string;

  @Enum({ items: () => PlanType, nullable: true, type: 'enum', default: null })
  currentPlan?: PlanType;

  @Property({ type: 'number', nullable: true, default: 0 })
  totalSims?: number;

  @Property({ type: 'text', nullable: true, default: null })
  sims?: string;

  @Property({ type: 'datetime', nullable: true, default: null })
  paymentDueDate?: string;
}
