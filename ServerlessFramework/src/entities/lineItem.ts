/**
 * LineItem Entity
 * -----------------
 *
 * The LineItem entity represents individual line items within an order in the system. It contains information
 * about the associated order, product, product variant, and price. This entity is mapped to a corresponding
 * database table and extends the BaseEntity class provided by MikroORM.
 *
 * Properties:
 * - orderId: Many-to-One relationship with the Order entity, representing the order to which the line item belongs.
 * - productId: Many-to-One relationship with the Product entity, representing the product associated with the line item.
 * - productVariantId: Many-to-One relationship with the ProductsVariant entity, representing the product variant associated
 *   with the line item.
 * - price: The price of the line item.
 *
 * Relationships:
 * - LineItem has a many-to-one relationship with the Order entity via the orderId property.
 * - LineItem has a many-to-one relationship with the Product entity via the productId property.
 * - LineItem has a many-to-one relationship with the ProductsVariant entity via the productVariantId property.
 *
 * Usage:
 * This entity is utilized for representing individual line items within customer orders. It plays a crucial role in
 * associating products and their variants with specific orders, as well as storing pricing information for each line item.
 *
 * Note: The entity uses MikroORM decorators (@Entity, @ManyToOne, @Property) to define its structure and relationships.
 */

import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Order } from './order';
import { Product } from './product';
import { ProductsVariant } from './productVariant';
import { EcommerceProductsVariant } from './eCommerceProductVariant';

@Entity({ tableName: 'lineItems' })
export class LineItem {
  @PrimaryKey({ type: 'bigint', autoincrement: true })
  id!: number;

  @Property({ nullable: true, onCreate: () => new Date(), type: 'datetime' })
  createdAt?: Date;

  @Property({ nullable: true, onCreate: () => new Date(), onUpdate: () => new Date(), type: 'datetime' })
  updatedAt?: Date;

  @ManyToOne(() => Order, { name: 'orderId' })
  orderId!: Order;

  @ManyToOne(() => Product, { name: 'productId' })
  productId!: Product;

  @ManyToOne(() => ProductsVariant, { name: 'productVariantId', nullable: true })
  productVariantId: ProductsVariant;

  @ManyToOne(() => EcommerceProductsVariant, { name: 'ecommerceProductVariantId', nullable: true })
  ecommerceProductVariantId: EcommerceProductsVariant;

  @Property({ type: 'float', default: 0 })
  price!: number;
}
