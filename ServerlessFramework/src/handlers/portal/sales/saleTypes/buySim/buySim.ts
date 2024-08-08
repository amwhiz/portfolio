/* eslint-disable require-await */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BuySimBuilder } from '../../interfaces/builders';
import { BuySimType } from '../../types/buySim';
import { WorkflowBase } from '@handlers/webhook-wati/workflows/pushToQueue';
import { KeyType } from '@aw/env';
import { SQSTypes } from 'src/constants/sqs';
import { Actions } from 'src/enums/actions';
import { FormTypes } from '../../enums/forms';
import { Templates } from 'src/constants/templates';
import { DeliveryType } from '../../interfaces/buySim';
import { getFullName } from 'src/helpers/getFullName';
import SimService from '@handlers/sim/sim';
import { dateNow } from 'src/helpers/dates';
import { SourceEnum } from 'src/entities/enums/customer';
import { Accounts, Order, ProductsVariant } from 'src/entities';
import { CommissionRequest } from '@handlers/portal/commission/interfaces/commissionRequest';

export class PortalBuySim {
  public async buildPayload<T extends BuySimType>(builder: BuySimBuilder, payload: T, formType?: FormTypes): Promise<void> {
    await builder.setDefaultProperties(payload, formType);
    await builder.sendWatiNotification();
  }
}

export class BuySimBuilderService extends WorkflowBase implements BuySimBuilder {
  private simPayload: BuySimType;
  private formType: FormTypes;
  private simService: SimService;

  constructor() {
    super();
    this.simService = new SimService();
  }

  async setDefaultProperties(payload: BuySimType, formType?: FormTypes): Promise<void> {
    this.formType = formType;
    this.simPayload = {
      ...payload,
    };
  }

  buildWatiNotificationParams(): any {
    const customer = this.simPayload.customerId;
    const params = {
      name: getFullName(customer.firstName, customer?.lastName),
      partner: this.simPayload.account.name,
      plan: this.simPayload.plan.replace(/ -.*/, ' Unlimited plan'),
      whatsappNumber: this.simPayload.whatsappNumber,
      action: Actions.Wati,
    };

    if ([FormTypes.BulkSim, FormTypes.ExpressSim].includes(this.formType)) {
      params['templateName'] = Templates.partnerBulkSim;
    } else if (this.formType === FormTypes.FreeSim) {
      params['templateName'] = Templates.partnerFreeSim;
    } else if (this.formType === FormTypes.CompleteSim && this.simPayload.deliveryType === DeliveryType['Door Delivery - R99']) {
      params['templateName'] = Templates.completeSimDoorDelivery;
    } else if (this.formType === FormTypes.CompleteSim && this.simPayload.deliveryType === DeliveryType['Free Collection Points']) {
      params['templateName'] = Templates.completeSimCollectionPoint;
    }
    return params;
  }

  async createOrder(): Promise<void> {
    await this.simService.ormInit();
    const orderPayload = {
      countryFrom: this.simPayload.checkoutId.countryFrom,
      countryTravelTo: this.simPayload.checkoutId.countryTravelTo,
      customerId: this.simPayload.checkoutId.customerId,
      orderDate: dateNow('Date') as Date,
      totalPrice: this.simPayload.checkoutId.totalPrice,
      type: this.simPayload.checkoutId.type,
      source: SourceEnum.portal,
      accountId: this.simPayload.account?.id as unknown as Accounts,
    } as Order;
    const order = await this.simService.createOrder(orderPayload);
    this.simPayload['orderId'] = order;

    // Portal Commission
    const commissionPayload: CommissionRequest = {
      simId: order?.simId,
      orderId: order,
      accountId: this.simPayload.account as unknown as Accounts,
      checkoutId: this.simPayload?.checkoutId,
    };

    await this.queueProcess(SQSTypes.commission, commissionPayload);
  }

  async getProductVariantById(variantId: number): Promise<ProductsVariant> {
    const variants = await this.simService.getProductVariantsByIds([variantId]);
    return variants?.length ? variants[0] : null;
  }

  async createLineItems(): Promise<void> {
    const products = this.simPayload.checkoutId.productsVariantId;
    const totalProducts = products?.length;
    for (let productsIndex = 0; productsIndex < totalProducts; productsIndex++) {
      const productId = products[productsIndex];
      const productVariant = await this.getProductVariantById(productId);
      const lineItem = {
        orderId: this.simPayload.orderId,
        price: productVariant.price,
        productId: productVariant.productId,
        productVariantId: productVariant,
      };
      await this.simService.createLineItem(lineItem);
    }
  }

  async sendWatiNotification(): Promise<void> {
    const watiNotificationParams = this.buildWatiNotificationParams();
    await this.queueProcess(SQSTypes.notification, watiNotificationParams);
    await this.createOrder();
    await this.createLineItems();
  }

  async queueProcess(queueType: KeyType, payload: object = {}): Promise<void> {
    await super.pushToQueue(queueType, payload);
    await super.delay(2000);
  }
}
