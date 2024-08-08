import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { ProductsVariant } from './productVariant';

@Entity({ tableName: 'commissionConfiguration' })
export class CommissionConfiguration {
  @PrimaryKey({ type: 'bigint', autoincrement: true })
  id!: number;

  @ManyToOne(() => ProductsVariant, { name: 'productVariantId' })
  productVariantId!: ProductsVariant;

  @Property({ type: 'float' })
  agencyCommissionPercent!: number;

  @Property({ type: 'float', default: 0 })
  agencyCommissionDefaultAmount!: number;

  @Property({ type: 'float', default: 0 })
  partnerCommissionDefaultAmount!: number;

  @Property({ type: 'string' })
  createdBy!: string;

  @Property({ type: 'string' })
  modifiedBy!: string;

  @Property({ type: 'datetime' })
  createdAt: Date = new Date();

  @Property({ type: 'datetime', onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
