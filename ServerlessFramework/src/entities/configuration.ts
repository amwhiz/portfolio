/**
 * Configuration Entity Class
 * --------------------------
 *
 * The Configuration entity class represents a configuration in the system. It defines properties such as the primary key (id),
 * configuration type (type), Slug (slug), configuration value (value), creation timestamp (createdAt), and update timestamp (updatedAt).
 *
 * Properties:
 * - id: The primary key that uniquely identifies each configuration (auto-incremented bigint).
 * - option_name: The type of configuration, using the configurationsEnum enum.
 * - option_value: The value associated with the configuration (text).
 * - createdAt: The date and time when the configuration was created (default: current date and time on instantiation).
 * - updatedAt: The date and time when the configuration was last updated (default: current date and time on instantiation,
 *   automatically updated on each modification using MikroORM's onUpdate option).
 *
 * Usage:
 * This entity class is used to model and interact with configuration data in the system. It leverages MikroORM decorators
 * (@PrimaryKey, @Enum, @Property) to define its structure and relationships. The updatedAt property is automatically updated
 * using MikroORM's onUpdate option, ensuring it reflects the latest modification timestamp for each configuration.
 */

import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'configurations' })
export class Configuration {
  @PrimaryKey({ type: 'bigint', autoincrement: true })
  id!: number;

  @Property({ type: 'text', nullable: false })
  option_name?: string;

  @Property({ type: 'text', nullable: false })
  option_value: string | undefined;

  @Property({ nullable: true, onCreate: () => new Date(), type: 'datetime' })
  createdAt?: Date;

  @Property({ nullable: true, onCreate: () => new Date(), onUpdate: () => new Date(), type: 'datetime' })
  updatedAt?: Date;
}
