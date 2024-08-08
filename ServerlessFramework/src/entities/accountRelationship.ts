/**
 * Relationship Entity
 * -------------------
 *
 * The Relationship entity represents the relationships between different accounts in the system.
 * It contains information about the parent account, child account, relationship type, creation timestamp,
 * and last update timestamp. This entity is mapped to a corresponding database table.
 *
 * Properties:
 * - parentAccountId: The ID of the parent account in the relationship.
 * - childAccountId: The ID of the child account in the relationship.
 * - relationshipType: The type of relationship between the accounts (e.g., Agency to User, Partner to Agency).
 * - createdAt: The date and time when the relationship was created.
 * - updatedAt: The date and time when the relationship was last updated.
 *
 * Relationships:
 * - Account has a many-to-one relationship with the Account entity via the parentAccountId and childAccountId property.
 *
 * Usage:
 * This entity is utilized for managing and tracking relationships between accounts in the system.
 * It allows establishing hierarchical relationships or associations between different types of accounts.
 * Each relationship is defined by a parent account, a child account, and the type of relationship.
 *
 * Note: The entity uses MikroORM decorators (@Entity, @Property, @Enum) to define its structure.
 * It ensures that each relationship entry includes the necessary information about the accounts involved
 * and the type of relationship established.
 */

import { Entity, PrimaryKey, Property, Enum, ManyToOne } from '@mikro-orm/core';
import { Accounts } from './account';
import { RelationshipType } from './enums/accountRelationship';

@Entity({ tableName: 'accountRelationships' })
export class Relationship {
  @PrimaryKey({ autoincrement: true, type: 'bigint' })
  id!: number;

  @ManyToOne(() => Accounts)
  parentAccountId!: Accounts;

  @ManyToOne(() => Accounts)
  childAccountId!: Accounts;

  @Enum({ items: () => RelationshipType, nullable: false, type: 'enum' })
  relationshipType!: RelationshipType;

  @Property({ nullable: true, onCreate: () => new Date(), type: 'datetime' })
  createdAt?: Date;

  @Property({ nullable: true, onCreate: () => new Date(), onUpdate: () => new Date(), type: 'datetime' })
  updatedAt?: Date;
}
