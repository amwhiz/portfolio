/**
 * Sim Entity
 * -----------
 *
 * The Sim entity represents SIM cards or similar entities in the system. It stores information about
 * SIM card details, including customer association, serial number, mobile number, SIM type, status,
 * and various activation-related codes and timestamps. This entity is mapped to a corresponding database
 * table and extends the BaseEntity class provided by MikroORM.
 *
 * Properties:
 * - customerId: Many-to-One relationship with the Customer entity, representing the associated customer.
 * - accountId: Many-to-One relationship with the Account entity, representing the associated account.
 * - serialNumber:An optional identifier for the type of serial number for the SIM card.
 * - mobileNo: An optional identifier for the type of  mobile phone number associated with the SIM card.
 * - simType: An enumeration representing the type of SIM card (e.g., regular, nano, micro).
 * - status: An enumeration representing the status of the SIM card (e.g., active, inactive).
 * - smtps: An optional identifier for the type of  identifier for the SIM card's secure module data protection system.
 * - activationCode: An optional identifier for the type of  code used for activating the SIM card.
 * - qrCode: An optional identifier for the type of  Quick Response (QR) code associated with the SIM card.
 * - qrCodeImag3: An optional identifier. An additional field possibly related to the QR code, but with a typo in the property name.
 * - purchasedAt: An optional identifier for the type of  date and time when the SIM card was purchased.
 * - activatedAt: An optional identifier for the type of  date and time when the SIM card was activated.
 * - countryTravelTo: The country to which the order pertains.
 * - countryFrom: The country from which the order originates.
 * - flowName: The flow name is use to track the customer flow.
 * - flutterOrderId: The flutter order id is use to track the flutter database order.
 * - contactId: The hubspot contact id is use to track the hubspot database order.
 * - simId: The hubspot sim id is use to track the hubspot database order.
 * - dealId: The hubspot deal id is use to track the hubspot database order.
 *
 * Relationships:
 * - Sim has a many-to-one relationship with the Customer entity via the customerId property.
 * - Account has a many-to-one relationship with the Account entity via the accountId property.
 *
 * Usage:
 * This entity is utilized for managing and tracking information related to SIM cards. It includes details
 * such as customer association, activation information, and status. The entity serves as the foundation for
 * handling SIM card-related operations and tracking their lifecycle in the application.
 *
 * Note: The entity uses MikroORM decorators (@Entity, @ManyToOne, @Property, @Enum) to define its structure
 * and relationships. There is a possible typo in the property name qrCodeImag3, which may need correction.
 */

import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Customer } from './customer';
import { SimTypesEnum } from './enums/common';
import { SimStatusEnum } from './enums/sim';
import { Accounts } from './account';

@Entity({ tableName: 'sims' })
export class Sim {
  @PrimaryKey({ type: 'bigint', autoincrement: true })
  id!: number;

  @Property({ nullable: true, onCreate: () => new Date(), type: 'datetime' })
  createdAt?: Date;

  @Property({ nullable: true, onCreate: () => new Date(), onUpdate: () => new Date(), type: 'datetime' })
  updatedAt?: Date;

  @ManyToOne(() => Customer, { name: 'customerId' })
  customerId!: Customer;

  @ManyToOne(() => Accounts, { name: 'accountId', nullable: true, default: null })
  accountId!: Accounts;

  @Property({ type: 'string', default: null, nullable: true })
  flutterOrderId!: string;

  @Property({ default: null, nullable: true, type: 'string' })
  serialNumber?: string;

  @Property({ default: null, nullable: true, type: 'string' })
  mobileNo?: string;

  @Property({ type: 'string', default: null, nullable: true })
  countryTravelTo!: string;

  @Property({ type: 'datetime', nullable: true, default: null })
  locationUpdatedDate!: Date;

  @Property({ type: 'string', default: null, nullable: true })
  countryFrom!: string;

  @Enum({ items: () => SimTypesEnum, type: 'enum' })
  simType!: SimTypesEnum;

  @Enum({ items: () => SimStatusEnum, type: 'enum' })
  status!: SimStatusEnum;

  @Property({ default: null, nullable: true, type: 'string' })
  smtps?: string;

  @Property({ default: false, type: 'bool' })
  isDoorDelivery?: boolean;

  @Property({ default: null, nullable: true, type: 'string' })
  activationCode?: string;

  @Property({ default: null, nullable: true, type: 'text' })
  qrCode?: string;

  @Property({ default: null, nullable: true, type: 'text' })
  qrImageUrl?: string;

  @Property({ type: 'datetime' })
  purchasedAt!: Date;

  @Property({ type: 'string', nullable: true, default: null })
  outBoundOrderId!: string;

  @Property({ type: 'string', nullable: true, default: null })
  trackingUrl!: string;

  @Property({ default: null, nullable: true, type: 'string' })
  flowName?: string;

  @Property({ type: 'string', default: null, nullable: true })
  contactId!: string;

  @Property({ type: 'string', default: null, nullable: true })
  dealId!: string;

  @Property({ type: 'string', default: null, nullable: true })
  simId!: string;

  @Property({ type: 'datetime', nullable: true, default: null })
  activatedAt!: Date;

  @Property({ type: 'string', nullable: true, default: null })
  simName?: string;
}
