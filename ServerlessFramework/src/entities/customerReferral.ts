/**
 * CustomerReferral Entity
 * -----------
 *
 * The CustomerReferral entity represents customer referrals or similar entities in the system. It stores information about
 * customer referrals, including customer associations, reward data, source, and timestamps. This entity is mapped to a corresponding database
 * table and extends the BaseEntity class provided by MikroORM.
 *
 * Properties:
 * - id: Primary key representing the unique identifier of the referral.
 * - createdAt: Creation timestamp indicating when the referral was created.
 * - customerId: Many-to-One relationship with the Customer entity, representing the associated customer who made the referral.
 * - referralCustomerId: Many-to-One relationship with the Customer entity, representing the referred customer.
 * - rewardData: Many-to-One relationship with the EcommerceProductsVariant entity, representing the associated product variant used as a reward.
 * - source: An enumeration representing the source of the referral.
 * - isTopupDone: A boolean flag indicating whether the top-up process is completed.
 * - topupDate: Date and time when the top-up was completed.
 *
 * Relationships:
 * - CustomerReferral has a many-to-one relationship with the Customer entity via the customerId property.
 * - CustomerReferral has a many-to-one relationship with the Customer entity via the referralCustomerId property.
 * - CustomerReferral has a many-to-one relationship with the EcommerceProductsVariant entity via the rewardData property.
 *
 * Usage:
 * This entity is utilized for managing and tracking information related to customer referrals. It includes details
 * such as customer associations, reward information, and top-up status. The entity serves as the foundation for
 * handling customer referral-related operations and tracking their lifecycle in the application.
 *
 * Note: The entity uses MikroORM decorators (@Entity, @PrimaryKey, @Property, @ManyToOne, @Enum) to define its structure
 * and relationships. Ensure to correct any typos in property names or relationships as needed.
 */

import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Customer } from './customer';
import { EcommerceProductsVariant } from './eCommerceProductVariant';
import { CustomerSourceEnum } from './enums/customerReferral';

@Entity({ tableName: 'customerReferrals' })
export class CustomerReferral {
  @PrimaryKey({ type: 'bigint', autoincrement: true })
  id!: number;

  @Property({ nullable: true, onCreate: () => new Date(), type: 'datetime' })
  createdAt?: Date;

  @ManyToOne(() => Customer, { name: 'customerId' })
  customerId!: Customer;

  @ManyToOne(() => Customer, { name: 'referralCustomerId' })
  referralCustomerId!: Customer;

  @ManyToOne(() => EcommerceProductsVariant, { name: 'productVariantId' })
  rewardData!: EcommerceProductsVariant;

  @Enum({ items: () => CustomerSourceEnum, type: 'enum' })
  source!: CustomerSourceEnum;

  @Property({ default: false, type: 'bool' })
  isTopupDone?: boolean;

  @Property({ type: 'datetime', nullable: true, default: null })
  topupDate!: Date;
}
