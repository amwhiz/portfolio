import { OutboundType, ItemNoType } from '@aw/shipment/aw-parcelNinja/enums/outbound';
import { OutboundRequest } from '@aw/shipment/interfaces/shipmentService';
import { WorkflowBase } from '../pushToQueue';
import { ILocationBuilder } from './interfaces/build';
import SimService from '@handlers/sim/sim';
import { ShipmentProcessor } from '@aw/shipment';
import { ParcelNinja } from '@aw/shipment/aw-parcelNinja';
import { IDeliveryTypeUpdate } from '@handlers/thirdParties/interfaces/locationUpdate';
import { Address, Checkout, Sim, SimPlan } from 'src/entities';
import { SQSTypes } from 'src/constants/sqs';
import { Actions } from 'src/enums/actions';
import { Templates } from 'src/constants/templates';
import ValidatorBase from '@handlers/validator/validator';
import { CRMWorkFlow } from 'src/enums/workflows';
import { getFullName } from 'src/helpers/getFullName';
import { MailPayload } from './types/mailPayload';

export class LocationBuilder {
  public async buildPayload(builder: ILocationBuilder): Promise<void> {
    await builder.setDefaultProperties();
    await builder.updateLocation();
    await builder.checkDelivery();
  }
}
export class LocationProperties {
  simId: Sim;
  country: string;
}

export class Location extends WorkflowBase implements ILocationBuilder {
  private shipmentClient: ShipmentProcessor;
  private simService: SimService;
  private event: IDeliveryTypeUpdate & LocationProperties;

  constructor(payload: IDeliveryTypeUpdate & LocationProperties) {
    super();
    this.simService = new SimService();
    const parcelNinja = new ParcelNinja();
    this.shipmentClient = new ShipmentProcessor(parcelNinja);

    this.event = payload;
  }

  private async getPlan(selectedOption: string, email: string): Promise<SimPlan> {
    const validator = new ValidatorBase(null);
    await validator.ormInit();
    const customer = await validator.getCustomerByEmail(email);
    const plans = await validator.getSimPlanByCustomer(customer);
    return plans[+selectedOption - 1];
  }

  async setDefaultProperties(): Promise<void> {
    await this.simService.ormInit();

    this.event['selectedOption'] = `${this.event?.selectedOption}`.toLowerCase() === 'yes' ? '1' : this.event?.selectedOption;
    // Direct Activation
    const selectedPlan: SimPlan = await this.getPlan(this.event?.selectedOption, this.event?.email);

    this.event = {
      ...this.event,
      simId: selectedPlan.simId,
    };
  }

  async updateLocation(): Promise<void> {
    const address = {
      address: this.event.line,
      city: this.event.city,
      country: this.event.country,
      customerId: this.event.simId.customerId,
      province: this.event.state,
      postalCode: this.event.postalCode,
    } as Address;
    await this.simService.createAddress(address);
  }

  buildEmailParams(outBoundPayload: OutboundRequest): MailPayload {
    return {
      customerName: outBoundPayload?.deliveryInfo?.customer,
      whatsappNumber: outBoundPayload?.deliveryInfo?.contactNo || '',
      address: outBoundPayload?.deliveryInfo?.addressLine1 || '',
      state: this.event?.state || '',
      suburb: this.event?.city || '',
      postalCode: outBoundPayload?.deliveryInfo?.postalCode || '',
      action: Actions.Email,
      name: 'Delivery Order',
      email: 'delivery@nextsim.travel',
      template: Templates.outBoundNotificationMail,
    };
  }

  async createParcelOrder(): Promise<void> {
    const outBounds = this.shipmentClient.outBound();

    const customer = this.event?.simId?.customerId;
    const outBoundPayload: OutboundRequest = {
      clientId: `OutBoundId-${this.event.simId?.customerId?.id}-${this.event.simId.id}`,
      typeId: OutboundType.outboundOrder,
      deliveryInfo: {
        addressLine1: this.event.line1,
        contactNo: customer?.whatsapp,
        customer: getFullName(customer.firstName, customer?.lastName),
        postalCode: this.event?.postalCode,
        suburb: this.event?.state,
        addressLine2: this.event?.line,
        companyName: '',
        deliveryOption: {
          deliveryQuoteId: 0, // Default Order to be collected at Warehouse
        },
        forCollection: false, // If delivery QuoteId is zero. forCollection default set true
      },
      items: [
        {
          itemNo: ItemNoType.NTCS,
          name: 'NextSim',
          qty: 1,
        },
      ],
    };

    const outBoundOrderId = await outBounds.create(outBoundPayload);
    await this.simService.updateSim(this.event.simId?.id, { outBoundOrderId });

    const crmPayload = {
      checkoutId: this.event.simId as unknown as Checkout,
      flowName: CRMWorkFlow.parcelNinja,
      isDoorDelivery: true,
      outBoundOrderId,
    };
    await super.pushToQueue(SQSTypes.crm, crmPayload);

    const emailParams = this.buildEmailParams(outBoundPayload);

    await super.pushToQueue(SQSTypes.emailNotification, emailParams);
  }

  async checkDelivery(): Promise<void> {
    if (this.event.deliveryType?.toLowerCase() === 'yes') await this.createParcelOrder();
  }
}
