/**
 * Checkout Entity
 * -----------------
 *
 * The Checkout entity represents the checkout process in the system. It contains information about the associated
 * customer, product variants, total price, referral code, transaction identifiers, device type, payment status,
 * completion status, and relevant timestamps. This entity is mapped to a corresponding database table and extends
 * the BaseEntity class provided by MikroORM.
 *
 * Properties:
 * - customerId: Many-to-One relationship with the Customer entity, representing the customer associated with the checkout.
 * - productsVariantId: Many-to-One relationship with the ProductsVariant entity (mapped to primary key), representing
 *   the product variants added to the checkout.
 * - totalPrice: The total price of the products in the checkout (default: 0).
 * - merchantTransactionId: The unique identifier for the merchant's transaction related to the checkout.
 * - deviceType: An optional identifier for the type of device associated with the checkout (nullable, default: null).
 * - isPaid: A boolean flag indicating whether the checkout is paid (default: false).
 * - paidAt: The date and time when the checkout was paid (nullable, default: null).
 * - isCompleted: A boolean flag indicating whether the checkout is completed (default: false).
 * - completedAt: The date and time when the checkout was completed (nullable, default: null).
 * - source: An enumeration representing the source of the checkout (default: unknown).
 * - accountId: Many-to-One relationship with the Account entity, representing the associated account.
 * - flowName: The flow name is use to track the customer flow.

 *
 * Lifecycle Hooks:
 * - BeforeUpdate: The `updateCheckoutProperties` method is called before updating the checkout. It automatically sets
 *   the completion and payment timestamps when the checkout is paid.
 *
 * Relationships:
 * - Checkout has a many-to-one relationship with the Customer entity via the customerId property.
 * - Account has a many-to-one relationship with the Account entity via the accountId property.
 * - Checkout has a many-to-one relationship with the ProductsVariant entity (mapped to primary key) via the productsVariantId property.
 *
 * Usage:
 * This entity is utilized for managing and tracking the checkout process in the system. It plays a crucial role in
 * associating customers with their selected products, handling payment and completion status, and capturing relevant
 * timestamps during the checkout process.
 *
 * Note: The entity uses MikroORM decorators (@Entity, @ManyToOne, @Property, @BeforeUpdate) to define its structure,
 * relationships, and lifecycle hooks.
 */

import { ArrayType, BeforeUpdate, Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Customer } from './customer';
import { SimTypesEnum } from './enums/common';
import { OrderType } from './enums/order';
import { SourceEnum } from './enums/customer';
import { Accounts } from './account';

@Entity({ tableName: 'checkouts' })
export class Checkout {
  @PrimaryKey({ type: 'bigint', autoincrement: true })
  id!: number;

  @Property({ nullable: true, onCreate: () => new Date(), type: 'datetime' })
  createdAt?: Date;

  @Property({ nullable: true, onCreate: () => new Date(), onUpdate: () => new Date(), type: 'datetime' })
  updatedAt?: Date;

  @ManyToOne(() => Customer, { name: 'customerId' })
  customerId!: Customer;

  @ManyToOne(() => Accounts, { name: 'accountId', nullable: true, default: null })
  accountId!: Accounts;

  @Property({ type: new ArrayType((i) => +i), nullable: true })
  productsVariantId: number[] = [];

  @Property({ default: false, type: 'bool' })
  isDoorDelivery?: boolean;

  @Property({ default: false, type: 'bool' })
  isCollectionPoint?: boolean;

  @Property({ type: 'float', default: 0 })
  totalPrice!: number;

  @Enum({ items: () => OrderType, type: 'enum', nullable: true, default: null })
  type!: OrderType;

  @Property({ type: 'string', default: null, nullable: true })
  countryTravelTo!: string;

  @Property({ type: 'string', default: null, nullable: true })
  countryFrom!: string;

  @Property({ type: 'string', default: null, nullable: true })
  contactId!: string;

  @Property({ type: 'string', default: null, nullable: true })
  dealId!: string;

  @Property({ type: 'string', default: null, nullable: true })
  simId!: string;

  @Property({ default: null, nullable: true, type: 'string' })
  flowName?: string;

  @Property({ type: 'string', default: null, nullable: true })
  merchantTransactionId!: string;

  @Enum({ items: () => SimTypesEnum, type: 'enum', default: null, nullable: true })
  simType: SimTypesEnum;

  @Property({ type: 'text', default: null, nullable: true })
  paymentLink!: string;

  @Enum({ items: () => SourceEnum, default: `${[SourceEnum.Unknown]}`, type: 'enum' })
  source!: SourceEnum;

  @Property({ type: 'string', default: null, nullable: true })
  planStartDate: string;

  @Property({ type: 'boolean', default: false })
  isPaid: boolean = false;

  @Property({ type: 'datetime', default: null, nullable: true })
  paidAt!: Date;

  @Property({ type: 'boolean', default: false })
  isCompleted: boolean = false;

  @Property({ default: null, type: 'datetime', nullable: true })
  completedAt!: Date;

  @BeforeUpdate()
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  updateCheckoutProperties() {
    if (this.isPaid && !this.paidAt) {
      this.isCompleted = true;
      this.completedAt = new Date();
      this.paidAt = new Date();
    }
  }
}
