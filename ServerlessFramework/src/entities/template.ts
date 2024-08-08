/**
 * Template Entity
 * ---------------
 *
 * The Template entity represents templates used within the system for various purposes.
 * It is designed to store information about template names, slugs, parameters, types,
 * content types, versions, and activation status. This entity is mapped to a corresponding
 * database table using MikroORM decorators and extends the BaseEntity class provided
 * by MikroORM.
 *
 * Properties:
 * - id: Primary key field with an auto-incrementing bigint type.
 * - createdAt: Date field for creation timestamp with nullable property and default value on create.
 * - updatedAt: Date field for update timestamp with nullable property, and default and update values.
 * - name: String field for the template name.
 * - slug: String field for the template slug.
 * - parentName: String field for the parent template name.
 * - parameters: Text field for storing parameters as a string.
 * - content: Text field for storing parameters as a string.
 * - type: Enum field for the template type with default value and enum items defined by SendType.
 * - contentType: Enum field for content type with default value, nullable property, and enum items defined by ContentType.
 * - version: Integer field for the template version.
 * - isActive: Boolean field indicating whether the template is active or not.
 * - archivedAt: Date field for archiving timestamp with nullable property.
 *
 * Relationships:
 * - No explicit relationships defined in this entity. It represents standalone template information.
 *
 * Usage:
 * This entity is utilized for storing and managing templates used throughout the application.
 * It serves as a foundation for handling template-related operations, such as creation, updates,
 * and retrieval from the database.
 *
 * Note: The entity uses MikroORM decorators (@Entity, @Enum, @Property) to define its structure and relationships.
 */

import { Entity, Enum, PrimaryKey, Property } from '@mikro-orm/core';
import { ContentType, SendType } from './enums/template';

@Entity({ tableName: 'templates' })
export class Template {
  @PrimaryKey({ type: 'bigint', autoincrement: true })
  id!: number;

  @Property({ nullable: true, onCreate: () => new Date(), type: 'datetime' })
  createdAt?: Date;

  @Property({ nullable: true, onCreate: () => new Date(), onUpdate: () => new Date(), type: 'datetime' })
  updatedAt?: Date;

  @Property({ type: 'string' })
  name!: string;

  @Property({ type: 'string' })
  slug!: string;

  @Property({ type: 'string' })
  parentName!: string;

  @Property({ type: 'text' })
  parameters!: string;

  @Property({ type: 'text' })
  content!: string;

  @Property({ type: 'text', default: null, nullable: true })
  subject: string;

  @Enum({ items: () => SendType, type: 'enum' })
  @Property({ type: 'text' })
  type!: string;

  @Enum({ items: () => ContentType, nullable: true, type: 'enum' })
  contentType!: string;

  @Property({ type: 'int' })
  version!: number;

  @Property({ type: 'boolean' })
  isActive!: boolean;

  @Property({ nullable: true, type: 'datetime' })
  archivedAt!: Date;
}
