/**
 * Product Entity
 * ---------------
 *
 * The Product entity represents individual products in the system. It contains information about product
 * details such as the product name, slug, deletion status, and deletion timestamp. This entity is mapped
 * to a corresponding database table and extends the BaseEntity class provided by MikroORM.
 *
 * Properties:
 * - name: An enumeration representing the name of the product.
 * - slug: An enumeration representing the slug (short identifier) of the product.
 * - isDeleted: A boolean flag indicating whether the product has been deleted (default: false).
 * - deletedAt: The date and time when the product was deleted (default: null, meaning not deleted).
 *
 * Usage:
 * This entity is utilized for managing and tracking information related to individual products in the system.
 * It plays a crucial role in handling product-specific details and tracking the deletion status of products
 * in the application.
 *
 * Note: The entity uses MikroORM decorators (@Entity, @Property, @Enum) to define its structure. Default values
 * are provided for some properties to represent common initial states.
 */

import { Entity, Enum, PrimaryKey, Property } from '@mikro-orm/core';
import { ProductNameEnum, ProductSlugEnum } from './enums/product';

@Entity({ tableName: 'products' })
export class Product {
  @PrimaryKey({ type: 'bigint', autoincrement: true })
  id!: number;

  @Property({ nullable: true, onCreate: () => new Date(), type: 'datetime' })
  createdAt?: Date;

  @Property({ nullable: true, onCreate: () => new Date(), onUpdate: () => new Date(), type: 'datetime' })
  updatedAt?: Date;

  @Enum({ items: () => ProductNameEnum, type: 'enum' })
  name!: ProductNameEnum;

  @Enum({ items: () => ProductSlugEnum, type: 'enum' })
  slug!: ProductSlugEnum;

  @Property({ type: 'boolean', default: false })
  isDeleted!: boolean;

  @Property({ type: 'datetime', default: null, nullable: true })
  deletedAt!: Date;
}
