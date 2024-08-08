/**
 * Address Entity
 * ---------------
 *
 * The Address entity represents customer addresses in the system. It contains information about the associated
 * customer, address details (such as street, city, province, country, postal code, and contact number), address
 * type, and whether it is the default address. This entity is mapped to a corresponding database table and extends
 * the BaseEntity class provided by MikroORM.
 *
 * Properties:
 * - customerId: Many-to-One relationship with the Customer entity, representing the customer associated with the address.
 * - address: The street or detailed address information.
 * - city: The city of the address.
 * - province: The province or state of the address.
 * - country: The country of the address.
 * - postalCode: The postal or ZIP code of the address.
 * - contactNo: The contact number associated with the address.
 * - addressType: An enumeration representing the type of address (e.g., residential, business).
 * - isDefault: A boolean flag indicating whether the address is the default address for the customer (default: false).
 *
 * Relationships:
 * - Address has a many-to-one relationship with the Customer entity via the customerId property.
 *
 * Usage:
 * This entity is utilized for managing and tracking customer addresses in the system. It plays a crucial role in
 * associating addresses with specific customers, identifying address types, and determining default addresses.
 *
 * Note: The entity uses MikroORM decorators (@Entity, @ManyToOne, @Property, @Enum) to define its structure and
 * relationships. Default values are provided for some properties to represent common initial states.
 */

import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Customer } from './customer';
import { AddressTypeEnum } from './enums/address';

@Entity({ tableName: 'address' })
export class Address {
  @PrimaryKey({ type: 'bigint', autoincrement: true })
  id!: number;

  @Property({ nullable: true, onCreate: () => new Date(), type: 'datetime' })
  createdAt?: Date;

  @Property({ nullable: true, onCreate: () => new Date(), onUpdate: () => new Date(), type: 'datetime' })
  updatedAt?: Date;

  @ManyToOne(() => Customer, { name: 'customerId' })
  customerId!: Customer;

  @Property({ type: 'string', nullable: true, default: null })
  address!: string;

  @Property({ type: 'string', nullable: true, default: null })
  city!: string;

  @Property({ type: 'string', nullable: true, default: null })
  province!: string;

  @Property({ type: 'string', nullable: true, default: null })
  country!: string;

  @Property({ type: 'string', nullable: true, default: null })
  postalCode!: string;

  @Property({ nullable: true, default: null, type: 'string' })
  contactNo?: string;

  @Enum({ items: () => AddressTypeEnum, nullable: true, default: null, type: 'enum' })
  addressType?: AddressTypeEnum;

  @Property({ type: 'boolean', default: false })
  isDefault: boolean = false;
}
