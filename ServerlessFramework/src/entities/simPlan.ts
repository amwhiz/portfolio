/**
 * SimPlan Entity
 * --------------
 *
 * The SimPlan entity represents plans associated with SIM cards or similar entities in the system.
 * It is designed to store information about the duration, expiration, and associated products
 * variants of a plan. This entity is mapped to a corresponding database table, and it extends the
 * BaseEntity class provided by MikroORM.
 *
 * Properties:
 * - simId: Many-to-One relationship with the Sim entity, representing the associated SIM card.
 * - productId: Many-to-One relationship with the Product entity, representing the
 *   associated product variant.
 * - startDate: The date when the plan starts. Default is set to null.
 * - expiryDate: The date when the plan expires. Default is set to null.
 * - actionDate: A date associated with some action related to the plan. Default is set to null.
 * - isExpired: A boolean flag indicating whether the plan is expired. Default is set to false.
 *
 * Relationships:
 * - SimPlan has a many-to-one relationship with the Sim entity via the simId property.
 * - SimPlan has a many-to-one relationship with the Product entity via the productId property.
 *
 * Usage:
 * This entity is utilized for storing and managing plans associated with SIM cards. It plays a crucial
 * role in tracking plan durations, expiration dates, and associated products. Additionally, it forms the
 * basis for database operations related to SIM card plans in the application.
 *
 * Note: The entity uses MikroORM decorators (@Entity, @ManyToOne, @Property) to define its structure
 * and relationships.
 */

import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Sim } from './sim';
import { Product } from './product';
import { ProductsVariant } from './productVariant';
import { EcommerceProductsVariant } from './eCommerceProductVariant';

@Entity({ tableName: 'simPlans' })
export class SimPlan {
  @PrimaryKey({ type: 'bigint', autoincrement: true })
  id!: number;

  @Property({ nullable: true, onCreate: () => new Date(), type: 'datetime' })
  createdAt?: Date;

  @Property({ nullable: true, onCreate: () => new Date(), onUpdate: () => new Date(), type: 'datetime' })
  updatedAt?: Date;

  @ManyToOne(() => Sim, { name: 'simId' })
  simId!: Sim;

  @ManyToOne(() => Product, { name: 'productId' })
  productId!: Product;

  @ManyToOne(() => ProductsVariant, { name: 'productVariantId', nullable: true, default: null })
  productVariantId!: ProductsVariant;

  @ManyToOne(() => EcommerceProductsVariant, { name: 'ecommerceProductVariantId', nullable: true, default: null })
  ecommerceVariantId!: EcommerceProductsVariant;

  @Property({ type: 'datetime', default: null })
  startDate!: Date;

  @Property({ type: 'boolean', default: false })
  isActive!: boolean;

  @Property({ type: 'datetime', default: null })
  expiryDate!: Date;

  @Property({ type: 'datetime', default: null })
  actionDate!: Date;

  @Property({ type: 'boolean', default: false })
  isExpired!: boolean;
}
