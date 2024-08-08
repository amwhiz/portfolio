import { WorkflowBase } from '@handlers/webhook-wati/workflows/pushToQueue';
import { ThirdParties } from './enums/thirdParty';
import { IParcelNinjaWebhook } from './interfaces/parcelninja';
import { IDeliveryTypeUpdate, ILocationUpdate } from './interfaces/locationUpdate';
import { ShipmentProcessor } from '@aw/shipment';
import { ParcelNinja } from '@aw/shipment/aw-parcelNinja';
import { IOutboundOrder, OutBoundService } from '@aw/shipment/interfaces/shipmentService';
import SimService from '@handlers/sim/sim';
import { SQSTypes } from 'src/constants/sqs';
import { Templates } from 'src/constants/templates';
import { Actions } from 'src/enums/actions';
import { Sim } from 'src/entities';
import { LoggerService } from '@aw/logger';
import { ConfigurationService } from 'src/configurations/configService';
import { Location } from 'src/types/configuration';
import { dateType, hubspotFormatDate } from 'src/helpers/dates';
import { CRMWorkFlow } from 'src/enums/workflows';
import { KeyType } from '@aw/env';

export class ThirdPartyService extends WorkflowBase {
  private thirdPartyType: ThirdParties;
  private event: IParcelNinjaWebhook | ILocationUpdate;
  private logger = new LoggerService({ serviceName: ThirdPartyService.name });

  constructor(event: IParcelNinjaWebhook | ILocationUpdate) {
    super();
    this.event = event;
  }

  async disPatchService(): Promise<void> {
    switch (this.thirdPartyType) {
      case ThirdParties.Cds: {
        const cdsService = new CdsService<ILocationUpdate>(this.event as ILocationUpdate);
        await cdsService.updateLocation();
        return;
      }
      case ThirdParties.parcelNinja: {
        const parcelNinja = new ParcelNinjaClient(this.event as IParcelNinjaWebhook);
        return await parcelNinja.parcelNinjaTrackingURLProcess();
      }
      default:
        this.logger.error('Unknown ThirdParty');
    }
  }

  async webhook(): Promise<void> {
    try {
      await this.queueProcess(SQSTypes.thirdParty, this.event);
    } catch (e) {
      this.logger.error('Unable push to queue', { error: e });
      return null;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async queueProcess(queueName: KeyType, notificationData: any = {}, templateName?: string): Promise<any> {
    const queue = await super.pushToQueue(queueName, {
      templateName,
      ...notificationData,
    });

    // Delay the execution 3 seconds, Otherwise notification receiving order might be changed.
    super.delay(3000);
    return queue;
  }
}

export class CdsService<T extends ILocationUpdate | IDeliveryTypeUpdate> extends WorkflowBase {
  private simService: SimService;
  private event: ILocationUpdate | IDeliveryTypeUpdate;
  private configService: ConfigurationService;
  private logger = new LoggerService({ serviceName: CdsService.name });
  private country: string;
  private sim: Sim;

  constructor(event: T) {
    super();
    this.event = event;
    this.simService = new SimService();
    this.configService = ConfigurationService.getInstance();
  }

  private async updateHubspot(): Promise<void> {
    const updateContactProp = {
      email: this.sim?.customerId?.email,
      mccCountry: this.country,
      locationUpdatedDate: hubspotFormatDate((this.event as ILocationUpdate).DateTimeEvent),
      sim: this.sim,
      flowName: CRMWorkFlow.Cds,
    };

    await super.pushToQueue(SQSTypes.crm, updateContactProp);
    await super.delay(2000);
  }

  async updateLocation(): Promise<void> {
    await this.simService.ormInit();
    if (!('MCC' in this.event) || !('Iccid' in this.event)) {
      this.logger.error('Iccid number not found');
      return;
    }

    const countryCodes = <Location[]>await this.configService.getValue('countryCodes');

    const country = countryCodes.find((country: Location) => String(country.MCC) === (this.event as ILocationUpdate).MCC).Country;
    this.logger.info(`Country ${country}`);

    this.sim = await this.simService.getSimBySerialNumber((this.event as ILocationUpdate).Iccid);

    if (!this.sim?.id) {
      this.logger.error('Iccid number not found in sim');
      return;
    }

    await this.simService.updateSim(this.sim.id, {
      serialNumber: (this.event as ILocationUpdate).Iccid,
      countryTravelTo: this.country,
      locationUpdatedDate: dateType((this.event as ILocationUpdate).DateTimeEvent) as unknown as Date,
    });

    await this.updateHubspot();
  }
}

export class ParcelNinjaClient extends WorkflowBase {
  private event: IParcelNinjaWebhook;
  private shipmentClient: ShipmentProcessor;
  private outBound: OutBoundService;
  private simService: SimService;
  private logger = new LoggerService({ serviceName: ParcelNinjaClient.name });

  constructor(event: IParcelNinjaWebhook) {
    super();
    this.event = event;
    this.simService = new SimService();
    const parcelNinja = new ParcelNinja();
    this.shipmentClient = new ShipmentProcessor(parcelNinja);
    this.outBound = this.shipmentClient.outBound();
  }

  private async updateTrackingURL(trackingUrl: string, sim: Sim): Promise<void> {
    await this.simService.updateSim(sim.id, { trackingUrl: trackingUrl });
  }

  private async sendTrackingURLNotification(outBound: IOutboundOrder, event: IParcelNinjaWebhook): Promise<void> {
    const sim = await this.simService.getSimByOutBoundId(`${outBound.id}`);
    if (!sim?.customerId?.whatsapp) {
      this.logger.error('----Whatsapp number not found, Unable to send notification----');
      return;
    }
    const whatsappNumber = sim?.customerId?.whatsapp;

    const watiNotificationProp = {
      whatsappNumber: whatsappNumber,
      trackingUrl: event?.deliveryInfo?.trackingURL,
      trackingNumber: event?.deliveryInfo?.waybillNumber,
      name: outBound?.deliveryInfo?.customer,
      action: Actions.Wati,
      templateName: Templates.trackingUrl,
    };

    await super.pushToQueue(SQSTypes.notification, watiNotificationProp);
    await this.updateTrackingURL(watiNotificationProp['trackingUrl'], sim);
    this.logger.info('----Finished sendTrackingURLNotification----');
  }

  async parcelNinjaTrackingURLProcess(): Promise<void> {
    await this.simService.ormInit();

    if (!this.event?.id || !this.event?.deliveryInfo) {
      this.logger.info('DeliveryInfo not found, No need to handle');
      return;
    }

    const outBound: IOutboundOrder = await this.outBound.get(this.event?.id);
    this.logger.info('----Get outBound data----', { outBound });

    await this.sendTrackingURLNotification(outBound, this.event);
  }
}
