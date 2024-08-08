/**
 * BaseEntity Abstract Class
 * --------------------------
 *
 * The BaseEntity abstract class serves as the foundation for all entities in the system. It defines common
 * properties such as the primary key (id), creation timestamp (createdAt), and update timestamp (updatedAt).
 * This abstract class is extended by other entities to inherit these properties and their behavior.
 *
 * Properties:
 * - id: The primary key that uniquely identifies each entity.
 * - createdAt: The date and time when the entity was created (default: current date and time on instantiation).
 * - updatedAt: The date and time when the entity was last updated (default: current date and time on instantiation,
 *   automatically updated on each modification using MikroORM's onUpdate option).
 *
 * Usage:
 * This abstract class is utilized as a common structure for all entities in the system. It provides a consistent
 * way to track creation and update timestamps for entities. Entities extending this class automatically inherit
 * these properties and their behavior.
 *
 * Note: The abstract class uses MikroORM decorators (@PrimaryKey, @Property) to define its structure. The updatedAt
 * property is automatically updated using MikroORM's onUpdate option, ensuring it reflects the latest modification
 * timestamp for each entity.
 */

import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
@Entity({ abstract: true })
export abstract class BaseEntity {
  @PrimaryKey({ type: 'bigint', autoincrement: true })
  id!: number;

  @Property({ type: 'datetime' })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date(), type: 'datetime' })
  updatedAt: Date = new Date();
}
