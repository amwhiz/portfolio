/* eslint-disable require-await */
import SimService from '@handlers/sim/sim';
import { Checkout, Order, Sim, SimPlan, ProductsVariant, SimActivity } from 'src/entities';
import { SimTypesEnum } from 'src/entities/enums/common';
import { OrderType } from 'src/entities/enums/order';
import { ProductNameEnum } from 'src/entities/enums/product';
import { SimStatusEnum } from 'src/entities/enums/sim';
import { dateNow, addDayAndFormat, minusOneDay } from 'src/helpers/dates';
import { omit } from 'lodash';
import { IOrderBuilder } from './interfaces/orderBuilder';
import { SourceEnum } from 'src/entities/enums/customer';
import { ProductVariantSkuEnum } from 'src/entities/enums/productVariant';

export class OrderSimBuilder {
  public async buildPayload<T extends OrderSim>(builder: IOrderBuilder, payload: T): Promise<OrderSim> {
    await builder.setDefaultProperties(payload);
    await builder.createOrder();
    await builder.createLineItems();
    await builder.createSim();
    await builder.createSimPlans();
    return builder.returnPayload();
  }
}

export class OrderSim {
  checkoutId?: Checkout;
  orderId?: Order;
  simId?: Sim;
  productVariants?: number[];
  simPlanPlan?: SimPlan;
  simPlanValidity?: SimPlan;
  simPlanAirtime?: SimPlan;
  serialNumber?: string;
  simActivityId?: SimActivity;
  flowName?: string;
  planStartDate: string;
  validity?: string;
  sources?: SourceEnum;
}

export class OrderBuilder implements IOrderBuilder {
  private simService: SimService;
  private orderSimPayload: OrderSim;

  private productPlans: string[] = Object.values(omit(ProductNameEnum, 'SimValidity'));

  constructor() {
    this.simService = new SimService();
  }

  async setDefaultProperties(payload: OrderSim): Promise<void> {
    this.orderSimPayload = {
      ...payload,
    };
  }

  async createOrder(): Promise<void> {
    await this.simService.ormInit();
    const orderPayload = {
      countryFrom: this.orderSimPayload.checkoutId.countryFrom,
      countryTravelTo: this.orderSimPayload.checkoutId.countryTravelTo,
      customerId: this.orderSimPayload.checkoutId.customerId,
      orderDate: dateNow('Date') as Date,
      totalPrice: this.orderSimPayload.checkoutId.totalPrice,
      type: OrderType.Activation,
      source: this.orderSimPayload.sources ?? SourceEnum.portal,
      accountId: this.orderSimPayload.checkoutId.accountId,
    } as Order;
    this.orderSimPayload['orderId'] = await this.simService.createOrder(orderPayload);
  }

  async getProductVariantById(variantId: number): Promise<ProductsVariant> {
    const variants = await this.simService.getProductVariantsByIds([variantId]);
    return variants?.length ? variants[0] : null;
  }

  async createLineItems(): Promise<void> {
    const products = this.orderSimPayload.checkoutId.productsVariantId;
    const totalProducts = products?.length;
    for (let productsIndex = 0; productsIndex < totalProducts; productsIndex++) {
      const productId = products[productsIndex];
      const productVariant = await this.getProductVariantById(productId);
      const lineItem = {
        orderId: this.orderSimPayload.orderId,
        price: productVariant.price,
        productId: productVariant.productId,
        productVariantId: productVariant,
      };
      await this.simService.createLineItem(lineItem);
    }
  }

  async createSim(): Promise<void> {
    const sim = {
      countryFrom: this.orderSimPayload.checkoutId.countryFrom,
      countryTravelTo: this.orderSimPayload.checkoutId.countryTravelTo,
      customerId: this.orderSimPayload.checkoutId.customerId,
      purchasedAt: dateNow('Date') as Date,
      simType: this.orderSimPayload.checkoutId.simType === SimTypesEnum.pSIM ? SimTypesEnum.pSIM : SimTypesEnum.eSIM,
      status: SimStatusEnum.NotActive,
      serialNumber: this.orderSimPayload?.serialNumber,
      isDoorDelivery: false, // * * Free Sim, Door Delivery default false.
      flowName: this.orderSimPayload.flowName,
      accountId: this.orderSimPayload?.checkoutId?.accountId,
    } as Sim;

    this.orderSimPayload.simId = await this.simService.createSim(sim);
  }

  async createSimActivity(queueResponse: object, productVariantId: ProductsVariant): Promise<void> {
    const simActivity = {
      productVariantId: productVariantId,
      queueId: queueResponse?.['MessageId'],
      simId: this.orderSimPayload.simId,
    };

    this.orderSimPayload['simActivityId'] = await this.simService.createSimActivity(simActivity);
  }

  async createSimPlans(): Promise<void> {
    const products = this.orderSimPayload.checkoutId.productsVariantId;
    const totalProducts = products?.length;
    for (let productsSimPlansIndex = 0; productsSimPlansIndex < totalProducts; productsSimPlansIndex++) {
      const productId = products[productsSimPlansIndex];
      const productVariant = await this.getProductVariantById(productId);

      const convertedDate = this.orderSimPayload.planStartDate;
      const simPlan = {
        productId: productVariant.productId,
        productVariantId: productVariant,
        isExpired: false,
        simId: this.orderSimPayload.simId,
      };

      if (this.orderSimPayload?.validity && ProductNameEnum.SimValidity === productVariant.productId.name) {
        // If a customer selects a plan with sim validity, for each plan the sim validity will be extended by 30 days.
        const validityDate = productVariant.sku === ProductVariantSkuEnum['30Days-Free'] ? 0 : 30;
        simPlan['startDate'] = addDayAndFormat(convertedDate, 0, 'date') as Date;
        simPlan['expiryDate'] = addDayAndFormat(convertedDate, productVariant.validityPeriod + validityDate, 'date') as Date;
        simPlan['actionDate'] = minusOneDay(addDayAndFormat(convertedDate, productVariant.validityPeriod + validityDate, 'date'), 'date') as Date;
      } else {
        simPlan['startDate'] = addDayAndFormat(convertedDate, 0, 'date') as Date;
        simPlan['expiryDate'] = addDayAndFormat(convertedDate, productVariant.validityPeriod, 'date') as Date;
        simPlan['actionDate'] = minusOneDay(addDayAndFormat(convertedDate, productVariant.validityPeriod, 'date'), 'date') as Date;
      }

      const simPlanDocument = await this.simService.crateSimPlan(simPlan);
      if (this.productPlans.includes(productVariant.productId.name)) {
        this.orderSimPayload.simPlanPlan = simPlanDocument;
      } else if (ProductNameEnum.SimValidity === productVariant.productId.name) {
        this.orderSimPayload.simPlanValidity = simPlanDocument;
      }
    }
  }

  returnPayload(): OrderSim {
    return this.orderSimPayload;
  }
}
