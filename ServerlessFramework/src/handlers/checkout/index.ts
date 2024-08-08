import { Accounts, Checkout, Customer } from 'src/entities';
import { SimTypesEnum } from 'src/entities/enums/common';
import { ProductVariantSkuEnum } from 'src/entities/enums/productVariant';
import { dateNow } from 'src/helpers/dates';
import SimService from '@handlers/sim/sim';
import { getNames } from 'src/helpers/getNames';
import { SourceEnum } from 'src/entities/enums/customer';
import { OrderType } from 'src/entities/enums/order';
import { BaseProperties } from '@handlers/webhook-wati/workflows/baseProperties';
import { BuyBuilder } from '@handlers/portal/sales/interfaces/builders';
import { BuySim, DeliveryType } from '@handlers/portal/sales/interfaces/buySim';
import { FormTypes } from '@handlers/portal/sales/enums/forms';
import { SQSTypes } from 'src/constants/sqs';
import { KeyType } from '@aw/env';
import { WorkflowBase } from '@handlers/webhook-wati/workflows/pushToQueue';
import { CRMWorkFlow } from 'src/enums/workflows';

export class PortalCreateCheckout {
  public async buildPayload<T>(builder: BuyBuilder, payload: T, account: Accounts): Promise<CheckoutPayload> {
    await builder.setDefaultProperties(payload, account);
    await builder.createCustomer();
    await builder.createAddress();
    await builder.setProducts();
    await builder.createCheckout();
    return builder.returnPayload();
  }
}

export class CheckoutPayload extends BaseProperties {
  customerId?: Customer;
  checkoutId?: Checkout;
  line1?: string = null;
  line2?: string = null;
  city?: string = null;
  postalCode?: string = null;
  home?: string = null;
  destination?: string = null;
  state?: string = null;
  country?: string = null;
  products?: number[];
  totalPrice?: number | string = 0;
  airtime?: string;
  validity?: string;
  passportNo?: string;
  link?: string;
  serialNumber?: string; // Need for 'already have a sim' flow
  productVariants?: number[];
  account?: Accounts;
  planStartDate: string;
  sources: SourceEnum;
  deliveryType?: DeliveryType;
}

export class CheckoutBuilder extends WorkflowBase implements BuyBuilder {
  private simService: SimService;
  private buySimPayload: CheckoutPayload;

  constructor() {
    super();
    this.simService = new SimService();
  }

  async setDefaultProperties(payload: BuySim, account: Accounts): Promise<void> {
    const { firstName, lastName } = getNames(payload?.customerName);
    await this.simService.ormInit();

    this.buySimPayload = {
      firstName: firstName,
      lastName: lastName,
      email: payload.email,
      whatsappNumber: payload?.whatsappNumber,
      destination: payload?.destination,
      home: payload?.home,
      plan: payload?.plan,
      planStartDate: payload?.planStartDate,
      simType: payload?.simType,
      flowName: payload?.['flowType'],
      parentName: payload?.parentFlowName,
      deviceType: payload.deviceType,
      device: payload.device,
      line1: payload?.line1,
      line2: payload?.line2,
      city: payload?.city,
      country: payload?.country,
      postalCode: payload?.postalCode,
      state: payload?.state,
      airtime: payload?.airtime,
      validity: payload?.validity,
      serialNumber: payload?.serialNumber,
      account: account,
      sources: payload?.sources,
      deliveryType: payload?.deliveryType,
    };
  }

  async createCustomer(): Promise<void> {
    let isCustomerExists = await this.simService.getCustomerByEmail(this.buySimPayload.email);
    if (!isCustomerExists?.accountId?.id) {
      const customers = {
        email: this.buySimPayload.email,
        firstName: this.buySimPayload.firstName ?? isCustomerExists?.firstName,
        lastName: this.buySimPayload.lastName ?? isCustomerExists?.lastName,
        source: this.buySimPayload.sources ?? isCustomerExists?.source,
        whatsapp: this.buySimPayload.whatsappNumber ?? isCustomerExists?.whatsapp,
        createdAt: <Date>dateNow('Date') ?? isCustomerExists?.createdAt,
        updatedAt: <Date>dateNow('Date') ?? isCustomerExists?.updatedAt,
        accountId: (this.buySimPayload.account?.id as unknown as Accounts) ?? isCustomerExists?.accountId?.id,
      } as Customer;

      isCustomerExists = await this.simService.createCustomer(customers);
    }
    this.buySimPayload.customerId = isCustomerExists;
  }

  async createAddress(): Promise<void> {
    const address = {
      address: `${this.buySimPayload?.line1 || ''},${this.buySimPayload?.line2 || ''}`,
      city: this.buySimPayload?.city,
      country: this.buySimPayload?.country,
      customerId: this.buySimPayload?.customerId,
      postalCode: this.buySimPayload?.postalCode,
      province: this.buySimPayload?.state,
    };

    if (!this.buySimPayload?.line1) return;

    await this.simService.createAddress(address);
  }

  async setProducts(): Promise<void> {
    const validity = this.buySimPayload?.validity || (this.buySimPayload.flowName === FormTypes.TopUp ? null : ProductVariantSkuEnum['30Days-Free']);
    const productVariants: string[] = [this.buySimPayload.plan, this.buySimPayload.airtime, validity].filter((notNull) => notNull);

    const products = await this.simService.getProductVariantsBySku(productVariants as ProductVariantSkuEnum[]);
    this.buySimPayload.products = products.map((variants) => variants.id);
    this.buySimPayload.totalPrice = products.map((variants) => variants.price).reduce((a, b) => a + b, 0);
  }

  getCheckoutPayload(): Checkout {
    const isFreeSim = false;
    return {
      completedAt: isFreeSim ? (dateNow('Date') as Date) : null,
      countryFrom: this.buySimPayload.home,
      countryTravelTo: this.buySimPayload.destination,
      isCompleted: isFreeSim,
      isPaid: isFreeSim,
      totalPrice: <number>this.buySimPayload.totalPrice || 0,
      paidAt: isFreeSim ? (dateNow('Date') as Date) : null,
      productsVariantId: this.buySimPayload.products,
      simType: SimTypesEnum[this.buySimPayload.simType],
      customerId: this.buySimPayload.customerId,
      type: this.buySimPayload.flowName === FormTypes.TopUp ? OrderType.Recharge : OrderType.Activation,
      source: SourceEnum.portal,
      accountId: this.buySimPayload.account?.id as unknown as Accounts,
      flowName: this.buySimPayload?.flowName,
      planStartDate: this.buySimPayload.planStartDate,
      isDoorDelivery: this.buySimPayload.deliveryType === DeliveryType['Door Delivery - R99'],
      isCollectionPoint: this.buySimPayload.deliveryType === DeliveryType['Free Collection Points'],
    } as Checkout;
  }

  async createCheckout(): Promise<void> {
    const checkout: Checkout = this.getCheckoutPayload();
    const checkoutDocument = await this.simService.createCheckout(checkout);
    this.buySimPayload.checkoutId = checkoutDocument;

    await this.queueProcess(SQSTypes.crm, {
      checkoutId: checkoutDocument.id as unknown as Checkout,
      flowName: CRMWorkFlow.Buy,
    });
    await this.simService.closeConnection();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async queueProcess(queueType: KeyType, payload: object = {}): Promise<any> {
    const response = await super.pushToQueue(queueType, payload);
    await super.delay(2000);
    return response;
  }

  returnPayload(): CheckoutPayload {
    return this.buySimPayload;
  }
}
