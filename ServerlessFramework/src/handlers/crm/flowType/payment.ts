/* eslint-disable @typescript-eslint/no-explicit-any */
import SimService from '@handlers/sim/sim';
import { Checkout, ProductsVariant } from 'src/entities';
import { PaymentStatus, PaymentTypes } from '@handlers/payments/enums/paymentStatus';
import { HubspotCRM } from '@aw/crm/crm/aw-hubspot';
import { env } from '@aw/env';
import { CRMProcessor } from '@aw/crm';
import { AssociationService, ContactService, CustomObjectService, DealService, LineItemService } from '@aw/crm/interfaces/crmServices';
import { ConfigurationService } from 'src/configurations/configService';
import { HubspotIds } from 'src/types/configuration';
import { PublicAssociationsForObject, AssociationSpecAssociationCategoryEnum } from '@aw/crm/crm/aw-hubspot/types/responseType';
import { SimResponse } from './interfaces/crmResponse';
import { getAssociation } from './helpers/getAssociations';
import { ProductNameEnum } from 'src/entities/enums/product';
import { IDeal, ISim, Products } from './interfaces/buy';
import { SimType, SimTypesEnum } from 'src/entities/enums/common';
import { checkValue } from './helpers/checkValue';
import { IPaymentBuilder } from './interfaces/builders';
import { SourceEnum } from 'src/entities/enums/customer';
import { hubspotFormatDate } from 'src/helpers/dates';
import { convertHubspotDate } from 'src/helpers/convertDate';
import { EcommerceProductsVariant } from 'src/entities/eCommerceProductVariant';

export class CRMPayment {
  public async buildPayload<T>(builder: IPaymentBuilder, payload: T): Promise<void> {
    await builder.setDefaultProperties(payload);
    await builder.updateDeal();
    await builder.createSim();
    await builder.updateContact();
  }
}

export class CRMPaymentPayload {
  deal: IDeal | undefined;
  checkout: Checkout;
  contact: { [key: string]: string } | undefined;
  paymentStatus: PaymentStatus;
  hubspotIds: {
    simId: string;
  };
  sim: ISim;
  existSimId: string;
}

export class CRMPaymentBuilder implements IPaymentBuilder {
  private simService: SimService;
  private crmPayload: CRMPaymentPayload;
  private crmClient: CRMProcessor;
  private dealService: DealService;
  private configService: ConfigurationService;
  private hubspotObjectIds: HubspotIds;
  private products: Products;
  private customObjectService: CustomObjectService;
  private lineItemService: LineItemService;
  private contactService: ContactService;
  private associationService: AssociationService;

  constructor() {
    const provider = new HubspotCRM({
      accessToken: env('hubspotToken'),
    });
    this.simService = new SimService();
    this.crmClient = new CRMProcessor(provider);
    this.dealService = this.crmClient.deal();
    this.customObjectService = this.crmClient.customObject();
    this.configService = ConfigurationService.getInstance();
    this.lineItemService = this.crmClient.lineItem();
    this.contactService = this.crmClient.contact();
    this.associationService = this.crmClient.association();
  }

  private updatePaymentStatus(paymentType): PaymentStatus {
    const status = {
      [PaymentTypes.initiated]: PaymentStatus.initiated,
      [PaymentTypes.expired]: PaymentStatus.expired,
      [PaymentTypes.completed]: PaymentStatus.success,
      [PaymentTypes.processing]: PaymentStatus.pending,
      [PaymentTypes.opened]: PaymentStatus.pending,
      [PaymentTypes.cancelled]: PaymentStatus.expired,
    };

    return status?.[paymentType] || PaymentStatus.failed;
  }

  private getLineItems(variants: ProductsVariant[] | EcommerceProductsVariant[]): void {
    this.products = {
      airtime: {
        name: null,
        price: null,
      },
      validity: {
        name: null,
        price: null,
      },
      plan: {
        name: null,
        price: null,
      },
      doorDelivery: {
        name: null,
        price: null,
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
      if (ProductNameEnum.UnlimitedPlans === variant.productId.name) {
        this.products.plan.name = variant.sku;
        this.products.plan.price = variant.price;
      }
    }
  }

  async doAssociation(): Promise<void> {
    await this.associationService.create(
      `${this.hubspotObjectIds.Deal_ObjectTypeId}`,
      `${this.crmPayload.checkout.dealId}`,
      `${this.hubspotObjectIds.Sim_ObjectTypeId}`,
      `${this.crmPayload?.existSimId}`,
      [
        {
          associationCategory: AssociationSpecAssociationCategoryEnum.UserDefined,
          associationTypeId: this.hubspotObjectIds.Deal_to_SIM,
        },
      ]
    );
  }

  private getDealStage(paymentStatus: string, checkout: Checkout): { dealstage: string } {
    let stageMap: { Expired?: number; Cancelled?: number; Processing?: number; Completed: number } = {
      Expired: this.hubspotObjectIds.Pipelines.wati.stages.expired,
      Cancelled: this.hubspotObjectIds.Pipelines.wati.stages.cancelled,
      Processing: this.hubspotObjectIds.Pipelines.wati.stages.pending,
      Completed: this.hubspotObjectIds.Pipelines.wati.stages.completed,
    };

    if (checkout?.accountId) {
      stageMap = {
        Expired: this.hubspotObjectIds.Pipelines.sim.stages.expired,
        Cancelled: this.hubspotObjectIds.Pipelines.sim.stages.cancelled,
        Processing: this.hubspotObjectIds.Pipelines.sim.stages.pending,
        Completed: this.hubspotObjectIds.Pipelines.sim.stages.completed,
      };
    }
    if (checkout.source === SourceEnum.Shopify) {
      stageMap = {
        Completed: this.hubspotObjectIds.Pipelines.shopify.stages.completed,
      };
    }

    const defaultStage = checkout?.accountId
      ? this.hubspotObjectIds.Pipelines.sim.stages.initiated
      : this.hubspotObjectIds.Pipelines.wati.stages.initiated;

    const dealstage = stageMap[paymentStatus] || defaultStage;

    return { dealstage };
  }

  async setDefaultProperties(payload: any): Promise<void> {
    await this.simService.ormInit();
    const checkout = await this.simService.getCheckoutById(payload?.checkoutId, true);

    this.hubspotObjectIds = (await this.configService.getValue('hubspotIds')) as HubspotIds;

    const customer = checkout.customerId;
    const address = await this.simService.getAddressByCustomer(customer);
    const simType = checkout.simType === SimTypesEnum.eSIM ? SimType.eSIM : SimType.pSIM;
    let variants;
    if (checkout.source === SourceEnum.Shopify) {
      variants = await this.simService.getVariantsByIds(checkout.productsVariantId);
    } else {
      variants = await this.simService.getProductVariantsByIds(checkout.productsVariantId);
    }
    this.getLineItems(variants);
    const pipeLines = this.getDealStage(payload?.paymentStatus, checkout);

    const customerName = `${checkValue(customer?.firstName)} ${checkValue(customer?.lastName)}`;
    this.crmPayload = {
      deal: {
        plan_start_date: convertHubspotDate(checkout?.planStartDate),
        dealstage: pipeLines.dealstage,
        payment_status: this.updatePaymentStatus(payload?.paymentStatus),
        airtime: this.products?.airtime.name,
        sim_validity: this.products?.validity.name,
        amount: `${checkout.totalPrice}`,
        invoice: `Invoice-${checkout.id}`,
        payment_link: checkout.paymentLink,
        sim_type: simType,
        delivery_address: [address?.address, address?.city, address?.province, address?.country, address?.postalCode]
          .filter((isTrue) => isTrue)
          .join(','),
        paid_at: checkout?.paidAt ? hubspotFormatDate(checkout?.paidAt) : null,
        flow_name: checkout?.flowName,
        destination: checkout.countryTravelTo,
        delivery_type: checkout?.isDoorDelivery ? 'Yes' : 'No',
      },
      paymentStatus: payload?.paymentStatus as PaymentStatus,
      checkout: checkout,
      hubspotIds: {
        simId: '',
      },
      sim: {
        airtime: this.products.airtime.name,
        email: customer.email,
        plan: this.products.plan.name,
        mobile_number: customer.whatsapp,
        sim_validity: this.products.validity.name,
        type: simType?.toLowerCase(),
        name: customerName,
        plan_start_date: convertHubspotDate(checkout?.planStartDate),
      },
      contact: {
        address: address?.address,
        address2: address?.address,
        city: address?.city,
        state: address?.province,
        country: address?.country,
        zip: address?.postalCode,
        destination: checkout?.countryTravelTo,
      },
      existSimId: payload?.simId,
    };
  }

  async updateContact(): Promise<void> {
    if (this.crmPayload?.checkout?.isDoorDelivery) await this.contactService.update(this.crmPayload?.checkout?.contactId, this.crmPayload.contact);
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
              this.crmPayload?.checkout?.dealId,
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

  async updateDeal(): Promise<void> {
    await this.dealService.update(this.crmPayload.checkout.dealId, this.crmPayload.deal);
    if (this.crmPayload?.checkout?.source === SourceEnum.portal) {
      await this.createLineItems();
    }
  }

  async createSim(): Promise<void> {
    if (this.crmPayload.deal.payment_status === PaymentStatus.success && !this.crmPayload?.existSimId) {
      const association: PublicAssociationsForObject[] = [
        getAssociation(
          this.crmPayload.checkout.contactId,
          AssociationSpecAssociationCategoryEnum['UserDefined'],
          this.hubspotObjectIds.Sims_to_contact
        ),
        getAssociation(this.crmPayload.checkout.dealId, AssociationSpecAssociationCategoryEnum['UserDefined'], this.hubspotObjectIds.Sims_to_deal),
      ];

      const simResponse = (await this.customObjectService.create(this.hubspotObjectIds.sim, this.crmPayload.sim, association)) as SimResponse;
      this.crmPayload['hubspotIds']['simId'] = simResponse?.['id'];
      await this.updateHubspotIds();
    } else if (this.crmPayload.deal.payment_status === PaymentStatus.success && this.crmPayload?.existSimId) {
      await this.doAssociation();
    }
  }

  async updateHubspotIds(): Promise<void> {
    await this.simService.updateCheckoutById(this.crmPayload.checkout, this.crmPayload.hubspotIds);
    await this.simService.closeConnection();
  }
}
