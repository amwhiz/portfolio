/**
 * SimActivity Entity
 * -------------------
 *
 * The SimActivity entity represents activities related to SIM cards or similar entities in the system.
 * It is designed to store information about scheduled activities, queues, completion status, and timestamps
 * for scheduled and completed events. This entity is mapped to a corresponding database table and extends
 * the BaseEntity class provided by MikroORM.
 *
 * Properties:
 * - simId: Many-to-One relationship with the Sim entity, representing the associated SIM card.
 * - productVariantId: Many-to-One relationship with the ProductsVariant entity, representing the associated
 *   product variant.
 * - scheduleId: A unique identifier for the schedule associated with the activity.
 * - queueId: A unique identifier for the queue associated with the activity.
 * - isScheduled: A boolean flag indicating whether the activity is scheduled. Default is set to false.
 * - scheduledAt: The date and time when the activity is scheduled. Default is set to null.
 * - isComplete: A boolean flag indicating whether the activity is complete. Default is set to false.
 * - completedAt: The date and time when the activity is marked as complete. Default is set to null.
 *
 * Relationships:
 * - SimActivity has a many-to-one relationship with the Sim entity via the simId property.
 * - SimActivity has a many-to-one relationship with the ProductsVariant entity via the productVariantId property.
 *
 * Usage:
 * This entity is utilized for tracking and managing activities associated with SIM cards. It includes
 * information about scheduled events, queues, and completion status. The entity serves as the foundation
 * for managing scheduled and completed activities related to SIM cards in the application.
 *
 * Note: The entity uses MikroORM decorators (@Entity, @ManyToOne, @Property) to define its structure
 * and relationships.
 */

import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Sim } from './sim';
import { ProductsVariant } from './productVariant';
import { EcommerceProductsVariant } from './eCommerceProductVariant';

@Entity({ tableName: 'simActivities' })
export class SimActivity {
  @PrimaryKey({ type: 'bigint', autoincrement: true })
  id!: number;

  @Property({ nullable: true, onCreate: () => new Date(), type: 'datetime' })
  createdAt?: Date;

  @Property({ nullable: true, onCreate: () => new Date(), onUpdate: () => new Date(), type: 'datetime' })
  updatedAt?: Date;

  @ManyToOne(() => Sim, { name: 'simId' })
  simId!: Sim;

  @ManyToOne(() => ProductsVariant, { name: 'productVariantId', nullable: true, default: null })
  productVariantId: ProductsVariant;

  @ManyToOne(() => EcommerceProductsVariant, { name: 'eCommerceproductVariantId', nullable: true, default: null })
  eCommerceproductVariantId: EcommerceProductsVariant;

  @Property({ default: null, nullable: true, type: 'string' })
  scheduleId?: string;

  @Property({ default: null, nullable: true, type: 'string' })
  queueId?: string;

  @Property({ type: 'boolean', default: false, nullable: true })
  isScheduled!: boolean;

  @Property({ type: 'datetime', default: null, nullable: true })
  scheduledAt!: Date;

  @Property({ type: 'boolean', default: false, nullable: true })
  isComplete!: boolean;

  @Property({ type: 'datetime', default: null, nullable: true })
  completedAt!: Date;
}
