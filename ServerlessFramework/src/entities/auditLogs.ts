import { Entity, PrimaryKey, Enum, Property } from '@mikro-orm/core';

@Entity({ tableName: 'auditLogs' })
export class AuditLogs {
  @PrimaryKey({ type: 'bigint', autoincrement: true })
  id!: number;

  @Property({ type: 'int' })
  recordId!: number;

  @Enum({ type: 'string' })
  table!: string;

  @Property({ type: 'text' })
  oldValue!: string;

  @Property({ type: 'text' })
  newValue!: string;

  @Property({ type: 'string' })
  modifiedBy!: string;

  @Property({ type: 'datetime' })
  createdAt: Date = new Date();

  @Property({ type: 'datetime', onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
