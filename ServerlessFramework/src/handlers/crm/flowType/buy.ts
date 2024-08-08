/* eslint-disable @typescript-eslint/no-explicit-any */
import SimService from '@handlers/sim/sim';
import { IContact, IDeal, Products } from './interfaces/buy';
import { Checkout, ProductsVariant } from 'src/entities';
import { ProductNameEnum } from 'src/entities/enums/product';
import { PaymentStatus } from '@handlers/payments/enums/paymentStatus';
import { SimType, SimTypesEnum } from 'src/entities/enums/common';
import { HubspotCRM } from '@aw/crm/crm/aw-hubspot';
import { env } from '@aw/env';
import { CRMProcessor } from '@aw/crm';
import { ContactService, DealService, LineItemService } from '@aw/crm/interfaces/crmServices';
import { ContactResponse } from './interfaces/crmResponse';
import { LoggerService } from '@aw/logger';
import { ContactProperties } from './constants/properties';
import { AssociationSpecAssociationCategoryEnum, PublicAssociationsForObject } from '@aw/crm/crm/aw-hubspot/types/responseType';
import { ConfigurationService } from 'src/configurations/configService';
import { HubspotIds } from 'src/types/configuration';
import { getAssociation } from './helpers/getAssociations';
import { checkValue } from './helpers/checkValue';
import { SourceEnum } from 'src/entities/enums/customer';
import { OrderChannels } from './enums/orderType';
import { IBuyBuilder } from './interfaces/builders';
import { Role } from 'src/entities/enums/account';
import { convertHubspotDate } from 'src/helpers/convertDate';
import { OrderType } from 'src/entities/enums/order';
import { EcommerceProductsVariant } from 'src/entities/eCommerceProductVariant';

export class CRMBuy {
  public async buildPayload<T>(builder: IBuyBuilder, payload: T): Promise<void> {
    await builder.setDefaultProperties(payload);
    await builder.upsetContact();
    await builder.createDeal();
    await builder.updateHubspotIds();
  }
}

export class CRMBuyPayload {
  contact: IContact | undefined;
  deal: IDeal | undefined;
  hubspotIds: {
    contactId: string | undefined;
    dealId: string | undefined;
    simId: string | undefined;
  } = {
    contactId: '',
    dealId: '',
    simId: '',
  };
  checkout?: Checkout;
}

export class CRMBuyBuilder implements IBuyBuilder {
  private simService: SimService;
  private crmPayload: CRMBuyPayload | undefined;
  private crmClient: CRMProcessor;
  private contactService: ContactService;
  private dealService: DealService;
  private lineItemService: LineItemService;
  private logger = new LoggerService({ serviceName: CRMBuyBuilder.name });
  private configService: ConfigurationService;
  private hubspotObjectIds?: HubspotIds;
  private products?: Products;

  constructor() {
    const provider = new HubspotCRM({
      accessToken: env('hubspotToken'),
    });
    this.simService = new SimService();
    this.crmClient = new CRMProcessor(provider);
    this.contactService = this.crmClient.contact();
    this.dealService = this.crmClient.deal();
    this.lineItemService = this.crmClient.lineItem();
    this.configService = ConfigurationService.getInstance();
  }

  private getLineItems(variants: ProductsVariant[] | EcommerceProductsVariant[]): void {
    this.products = {
      airtime: {
        name: '',
        price: 0,
      },
      validity: {
        name: '',
        price: 0,
      },
      plan: {
        name: '',
        price: 0,
      },
      doorDelivery: {
        name: '',
        price: 0,
      },
      spinWheelPlan: {
        name: '',
        price: 0,
      },
    };

    for (const element of variants) {
      const variant = element;
      if (ProductNameEnum.AirTime === variant.productId.name) {
        this.products.airtime.name = variant.sku;
        this.products.airtime.price = variant.price;
      }
      if (ProductNameEnum.SimValidity === variant.productId.name) {
        this.products.validity.name = variant.sku;
        this.products.validity.price = variant.price;
      }
      if (ProductNameEnum.UnlimitedPlans === variant.productId.name && !this.products.plan.name) {
        this.products.plan.name = variant.sku;
        this.products.plan.price = variant.price;
      }
      if (ProductNameEnum.UnlimitedPlans === variant.productId.name) {
        this.products.spinWheelPlan.name = variant.sku;
        this.products.spinWheelPlan.price = variant.price;
      }
      if (ProductNameEnum.DoorDelivery === variant.productId.name) {
        this.products.doorDelivery.name = variant.sku;
        this.products.doorDelivery.price = variant.price;
      }
    }
  }

  private getDealStage(checkout: Checkout): { pipeline: string; dealstage: string; order_channel: OrderChannels } {
    const sourcesStages = {
      [SourceEnum.Airport as string]: {
        pipeline: this.hubspotObjectIds?.Pipelines.wati.id as unknown as string,
        dealstage: this.hubspotObjectIds?.Pipelines.wati.stages.open as unknown as string,
        order_channel: OrderChannels.chatbot,
      },
      [SourceEnum.Chatbot as string]: {
        pipeline: this.hubspotObjectIds?.Pipelines.wati.id as unknown as string,
        dealstage: this.hubspotObjectIds?.Pipelines.wati.stages.open as unknown as string,
        order_channel: OrderChannels.chatbot,
      },
      [SourceEnum.ECommerce as string]: {
        pipeline: this.hubspotObjectIds?.Pipelines.sim.id as unknown as string,
        dealstage: this.hubspotObjectIds?.Pipelines.sim.stages.single as unknown as string,
        order_channel: OrderChannels['e-Commerce'],
      },
      [SourceEnum.Shopify as string]: {
        pipeline: this.hubspotObjectIds?.Pipelines.shopify.id as unknown as string,
        dealstage: this.hubspotObjectIds?.Pipelines.shopify.stages.open as unknown as string,
        order_channel: OrderChannels.shopify,
      },
      [SourceEnum.portal as string]: {
        pipeline: this.hubspotObjectIds?.Pipelines.sim.id as unknown as string,
        dealstage: this.hubspotObjectIds?.Pipelines.sim.stages.single as unknown as string,
        order_channel: OrderChannels.portal,
      },
      [SourceEnum.Unknown as string]: {
        pipeline: this.hubspotObjectIds?.Pipelines.wati.id as unknown as string,
        dealstage: this.hubspotObjectIds?.Pipelines.wati.stages.open as unknown as string,
        order_channel: OrderChannels.chatbot,
      },
    };
    if (checkout?.accountId) checkout.source = SourceEnum.portal;

    const stage = sourcesStages[checkout.source];

    if (checkout.source === SourceEnum.Chatbot) {
      if (checkout.isPaid) {
        stage.dealstage = this.hubspotObjectIds?.Pipelines.wati.stages.pending as unknown as string;
      } else {
        stage.dealstage = this.hubspotObjectIds?.Pipelines.wati.stages.initiated as unknown as string;
      }
    }

    if (checkout.type === OrderType.Recharge) {
      stage.pipeline = this.hubspotObjectIds.Pipelines.existsSIM.id as unknown as string;
      stage.dealstage = this.hubspotObjectIds.Pipelines.existsSIM.stages.new as unknown as string;
      if (checkout.source === SourceEnum.Chatbot) stage.order_channel = OrderChannels.chatbot;
      else if (checkout.source === SourceEnum.Shopify) stage.order_channel = OrderChannels.shopify;
      else stage.order_channel = OrderChannels.portal;
    }

    return stage;
  }

  async setDefaultProperties(payload: any): Promise<void> {
    await this.simService.ormInit();
    const checkout = await this.simService.getCheckoutById(payload?.checkoutId, true);

    const customer = checkout.customerId;
    const address = await this.simService.getAddressByCustomer(customer);
    let variants;
    if (checkout.source === SourceEnum.Shopify) {
      variants = await this.simService.getVariantsByIds(checkout.productsVariantId);
    } else {
      variants = await this.simService.getProductVariantsByIds(checkout.productsVariantId);
    }
    this.getLineItems(variants);

    const simType = checkout.simType === SimTypesEnum.eSIM ? SimType.eSIM : SimType.pSIM;
    this.hubspotObjectIds = (await this.configService.getValue('hubspotIds')) as HubspotIds;

    const pipeLines = this.getDealStage(checkout);

    const customerName = `${checkValue(customer?.firstName)} ${checkValue(customer?.lastName)}`;
    this.crmPayload = {
      contact: {
        firstname: <string>checkValue(customer?.firstName),
        lastname: <string>checkValue(customer?.lastName),
        address: address?.address,
        address2: address?.address,
        city: address?.city,
        state: address?.province,
        country: address?.country,
        phone: customer?.whatsapp,
        zip: address?.postalCode,
        email: customer?.email,
        destination: checkout?.countryTravelTo,
      },
      deal: {
        order_channel: pipeLines.order_channel,
        pipeline: pipeLines.pipeline,
        dealstage: pipeLines.dealstage,
        dealname: customerName,
        airtime: this.products?.airtime.name,
        sim_validity: this.products?.validity.name,
        amount: `${checkout.totalPrice}`,
        invoice: `Invoice-${checkout.id}`,
        payment_link: checkout.paymentLink,
        payment_status: PaymentStatus['pending'],
        plan: this.products?.plan.name,
        sim_type: simType,
        delivery_address: [address?.address, address?.city, address?.province, address?.country, address?.postalCode]
          .filter((isTrue) => isTrue)
          .join(','),
        plan_start_date: convertHubspotDate(checkout?.planStartDate),
        flow_name: checkout?.flowName,
        destination: checkout.countryTravelTo,
        delivery_type: checkout?.isDoorDelivery ? 'Yes' : 'No',
      },
      hubspotIds: {
        contactId: '',
        dealId: '',
        simId: '',
      },
      checkout: checkout,
    };
  }

  async upsetContact(): Promise<void> {
    let isContactExists = await this.contactService.get<ContactResponse>(this.crmPayload?.contact?.email, ContactProperties, undefined, 'email');
    let association = undefined;
    if (this.crmPayload?.checkout?.accountId?.hubspotUserId) {
      const associationObjectTypeId = {
        [Role.AGENCY as string]: this.hubspotObjectIds.Agencies_to_contact,
        [Role.USER_AGENT as string]: this.hubspotObjectIds.Contact_to_partners,
      };

      association = this.crmPayload?.checkout?.accountId
        ? [
            getAssociation(
              this.crmPayload?.checkout?.accountId?.hubspotUserId,
              AssociationSpecAssociationCategoryEnum['UserDefined'],
              associationObjectTypeId[this.crmPayload?.checkout?.accountId?.role]
            ),
          ]
        : undefined;
    }
    if (!isContactExists?.id) {
      this.logger.info('Contact not exists');
      isContactExists = (await this.contactService.create(this.crmPayload?.contact, association)) as ContactResponse;
    } else {
      isContactExists = await this.contactService.update(isContactExists.id, this.crmPayload?.contact as any);
    }
    this.crmPayload['hubspotIds']['contactId'] = isContactExists?.['id'];
  }

  private async createLineItems(): Promise<void> {
    const lineItems = {
      inputs: [],
    };

    for (const product in this.products) {
      if (this.hubspotObjectIds?.[this.products[product]?.name]) {
        const lineItemProp = {
          properties: {
            hs_product_id: this.hubspotObjectIds[this.products[product].name],
            name: this.products[product].name,
            quantity: 1,
            amount: this.products[product].price,
          },
          associations: [
            getAssociation(
              this.crmPayload?.hubspotIds?.dealId,
              AssociationSpecAssociationCategoryEnum['HubspotDefined'],
              this.hubspotObjectIds.Deal_to_lineItem
            ),
          ],
        };
        lineItems.inputs.push(lineItemProp);
      }
    }
    await this.lineItemService.batchCreate(lineItems);
  }

  async createDeal(): Promise<void> {
    const association: PublicAssociationsForObject[] = [
      getAssociation(
        this.crmPayload.hubspotIds.contactId,
        AssociationSpecAssociationCategoryEnum['HubspotDefined'],
        this.hubspotObjectIds.Deal_to_Contact
      ),
    ];

    if (this.crmPayload?.checkout?.accountId?.hubspotUserId) {
      const associationObjectTypeId = {
        [Role.AGENCY as string]: this.hubspotObjectIds.Deal_to_Agency,
        [Role.USER_AGENT as string]: this.hubspotObjectIds.Deal_to_UserAgent,
      };

      const accountAssociation = this.crmPayload?.checkout?.accountId
        ? getAssociation(
            this.crmPayload?.checkout?.accountId?.hubspotUserId,
            AssociationSpecAssociationCategoryEnum['UserDefined'],
            associationObjectTypeId[this.crmPayload?.checkout?.accountId?.role]
          )
        : undefined;

      if (accountAssociation) association.push(accountAssociation);
    }

    const dealResponse = await this.dealService.create(this.crmPayload.deal, association);
    this.crmPayload.hubspotIds.dealId = dealResponse?.['id'];

    await this.createLineItems();
  }

  async updateHubspotIds(): Promise<void> {
    await this.simService.updateCheckoutById(this.crmPayload.checkout, this.crmPayload.hubspotIds);
    await this.simService.closeConnection();
  }
}
