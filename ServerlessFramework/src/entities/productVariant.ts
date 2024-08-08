/**
 * ProductsVariant Entity
 * -----------------------
 *
 * The ProductsVariant entity represents different variants of products in the system. It contains information
 * about product variant details such as the associated product, variant name, SKU, price, currency, activation
 * status, and other relevant properties. Alike airtime, sim validity, plan and door delivery. This entity is mapped to a corresponding database table and extends
 * the BaseEntity class provided by MikroORM.
 *
 * Properties:
 * - productId: Many-to-One relationship with the Product entity, representing the associated product.
 * - name: An enumeration representing the name of the product variant.
 * - sku: An enumeration representing the Stock Keeping Unit (SKU) of the product variant.
 * - price: The price of the product variant.
 * - currency: An enumeration representing the currency in which the price is denominated (default: INR).
 * - isActive: A boolean flag indicating whether the product variant is currently active.
 * - checkoutId: Many-to-One relationship with the Checkout entity, representing the associated checkout (if any).
 * - liveDate: The date and time when the product variant became live (default: current date and time).
 * - deletedAt: The date and time when the product variant was deleted (default: null, meaning not deleted).
 *
 * Relationships:
 * - ProductsVariant has a many-to-one relationship with the Product entity via the productId property.
 * - ProductsVariant has a many-to-one relationship with the Checkout entity via the checkoutId property.
 *
 * Usage:
 * This entity is utilized for managing and tracking different variants of products. It plays a crucial role
 * in handling pricing, activation status, and other properties associated with product variants in the application.
 *
 * Note: The entity uses MikroORM decorators (@Entity, @ManyToOne, @Property, @Enum) to define its structure
 * and relationships. Default values are provided for some properties to represent common initial states.
 */

import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Product } from './product';
import { ProductVariantCurrencyEnum, ProductVariantNameEnum, ProductVariantSkuEnum } from './enums/productVariant';

@Entity({ tableName: 'productVariants' })
export class ProductsVariant {
  @PrimaryKey({ type: 'bigint', autoincrement: true })
  id!: number;

  @Property({ nullable: true, onCreate: () => new Date(), type: 'datetime' })
  createdAt?: Date;

  @Property({ nullable: true, onCreate: () => new Date(), onUpdate: () => new Date(), type: 'datetime' })
  updatedAt?: Date;

  @ManyToOne(() => Product, { name: 'productId' })
  productId!: Product;

  @Enum({ items: () => ProductVariantNameEnum, type: 'enum' })
  name!: ProductVariantNameEnum;

  @Enum({ items: () => ProductVariantSkuEnum, type: 'enum', nullable: true, default: null, unique: true, index: true })
  sku!: ProductVariantSkuEnum;

  @Property({ type: 'float' })
  price!: number;

  @Property({ type: 'float', nullable: true, default: 0 })
  defaultPrice!: number;

  @Property({ type: 'string', default: null, nullable: true })
  planCode!: string;

  @Property({ type: 'string', default: null, nullable: true })
  planId!: string;

  @Property({ type: 'int', default: 0 })
  validityPeriod!: number;

  @Enum({ items: () => ProductVariantCurrencyEnum, default: `${[ProductVariantCurrencyEnum.ZAR]}`, type: 'enum' })
  currency!: ProductVariantCurrencyEnum;

  @Property({ type: 'boolean', default: false })
  isActive!: boolean;

  @Property({ type: 'datetime', nullable: true, default: null })
  liveDate?: Date = new Date();

  @Property({ type: 'datetime', default: null, nullable: true })
  deletedAt!: Date;
}
