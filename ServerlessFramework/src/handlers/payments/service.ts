/* eslint-disable @typescript-eslint/no-explicit-any */
import { WorkflowBase } from '@handlers/webhook-wati/workflows/pushToQueue';
import { env, KeyType } from '@aw/env';
import { PaymentProcessor } from '@aw/pg';
import { PaymentProvider } from '@aw/pg/interfaces/paymentProvider';
import { Payment } from './interfaces/stripe';
import { Checkout, ProductsVariant, Sim, Order, SimPlan, BillingTransactions } from 'src/entities';
import { PaymentDetails } from './interfaces/payment';
import { PaymentType } from './constants/status';
import {
  addDayAndFormat,
  checkIsSameDate,
  dateNow,
  findAndConvertDate,
  getCurrentDate,
  minusOneDay,
  scheduleTimeWithThirtyMin,
} from 'src/helpers/dates';
import { CRMWorkFlow, ParentWorkflow } from 'src/enums/workflows';
import { SimType, SimTypesEnum } from 'src/entities/enums/common';
import { ProductVariantNameEnum, ProductVariantSkuEnum } from 'src/entities/enums/productVariant';
import { RechargeType } from '@handlers/webhook-wati/workflows/recharge/enums/recharge';
import EventScheduler from '@handlers/webhook-wati/workflows/scheduler';
import { ProductNameEnum } from 'src/entities/enums/product';
import { SimStatusEnum } from 'src/entities/enums/sim';
import { SQSTypes } from 'src/constants/sqs';
import SimService from '@handlers/sim/sim';
import { Templates } from 'src/constants/templates';
import { Actions } from 'src/enums/actions';
import { LoggerService } from '@aw/logger';
import { PaymentStatus } from './types/status';
import { PeachPayment } from '@aw/pg/aw-peach';
import { configurationsEnum } from 'src/entities/enums/configuration';
import { AppError } from '@libs/api-error';
import { ConfigurationService } from 'src/configurations/configService';
import { PeachWebhookType } from '@aw/pg/aw-peach/interfaces/payment';
import { Configuration } from 'src/entities/configuration';
import { paymentBuild } from './build/notes';
import { CurrencySymbol } from '@aw/pg/enums/regionCurrency';
import { ShipmentProcessor } from '@aw/shipment';
import { ParcelNinja } from '@aw/shipment/aw-parcelNinja';
import { OutboundRequest } from '@aw/shipment/aw-parcelNinja/interfaces/outbound';
import { ItemNoType, OutboundType } from '@aw/shipment/aw-parcelNinja/enums/outbound';
import { plans, validities, airtime, productPlans } from 'src/constants/productVariants';
import { BillingTransactionInvoice } from './interfaces/invoice';
import Sales from '@handlers/portal/sales/sales';
import { PartnerTermAction } from '@handlers/crm/flowType/enums/partnerTerm';
import { Providers } from '@aw/pg/enums/providers';
import { PlanType } from 'src/entities/enums/account';
import { formatVariants } from 'src/helpers/formatProductVariants';
import { calculateInvoiceAmount } from 'src/helpers/calculateInvoiceAmount';
import { buildLineItems } from './build/lineItems';
import { getFullName } from 'src/helpers/getFullName';
import { Countries } from 'src/constants/countries';
import { RegionBasedCurrency } from '@handlers/portal/constants/regionBasedCurrency';

export class PaymentPayload {
  checkoutId: Checkout;
  productVariants: number[];
  orderId: Order;
  serialNumber: string = '';
  simId: Sim;
  simPlan: SimPlan;
  planStartDate: string;
  validity: string;
  airtime: string;
  plan: string;
  simPlanAirtime: SimPlan;
  simPlanValidity: SimPlan;
  simPlanPlan: SimPlan;
  simAirtime: SimPlan;
  variants?: ProductsVariant[];
}

export default class PaymentService extends WorkflowBase {
  private simService: SimService;
  private logger = new LoggerService({ serviceName: PaymentService.name });
  private paymentStatus: PaymentStatus;
  private configService: ConfigurationService;
  private scheduleClient: EventScheduler;
  private shipmentClient: ShipmentProcessor;
  private isStripe: boolean = false;
  private provider: Providers;
  private rawEvent: any;
  private outBoundOrderId: string;

  private event: PeachWebhookType;
  private payment: PaymentPayload = {} as PaymentPayload;

  constructor(payload: any) {
    super();
    this.simService = new SimService();
    this.configService = ConfigurationService.getInstance();
    this.scheduleClient = new EventScheduler();
    const parcelNinja = new ParcelNinja();
    this.shipmentClient = new ShipmentProcessor(parcelNinja);

    this.isStripe = payload?.id;
    this.rawEvent = payload;

    if (this.isStripe) {
      this.event = payload?.data?.object;
      this.provider = Providers.Stripe;
    } else {
      this.provider = Providers.Peach;
      this.event = payload;
    }

    this.paymentStatus = PaymentType[payload?.type || payload?.status];
  }

  private async getPaymentDetails(payload: Payment): Promise<PaymentDetails> {
    const checkoutDocument = await this.simService.getCheckoutById(payload?.checkoutId, true);
    const productVariants = await this.simService.getProductVariantsByIds(checkoutDocument?.productsVariantId);

    this.payment['checkoutId'] = checkoutDocument;
    this.payment['serialNumber'] = payload?.serialNumber;
    this.payment['planStartDate'] = payload?.planStartDate || (dateNow('string') as string);
    this.payment['airtime'] = payload?.airtime;
    this.payment['validity'] = payload?.validity;
    this.payment['plan'] = payload?.plan;
    this.payment['productVariants'] = checkoutDocument?.productsVariantId;
    this.payment['variants'] = productVariants;
    this.payment['simId'] = payload?.simId as unknown as Sim;

    return {
      simType: checkoutDocument?.simType,
      completedAt: checkoutDocument?.completedAt,
      totalPrice: checkoutDocument?.totalPrice,
      whatsappNumber: checkoutDocument?.customerId?.whatsapp,
      email: checkoutDocument?.customerId?.email,
      variants: productVariants,
      planStartDate: payload?.planStartDate,
      serialNumber: payload?.serialNumber,
      simId: payload?.simId,
      airtime: payload?.airtime,
      validity: payload?.validity,
      plan: payload?.plan,
      device: payload?.device,
      isDoorDelivery: checkoutDocument?.isDoorDelivery,
    };
  }

  private async createOrder(): Promise<void> {
    const orderPayload = {
      countryFrom: this.payment.checkoutId.countryFrom,
      countryTravelTo: this.payment.checkoutId.countryTravelTo,
      customerId: this.payment.checkoutId.customerId,
      orderDate: dateNow('Date') as Date,
      totalPrice: this.payment.checkoutId.totalPrice,
      type: this.payment.checkoutId.type,
      source: this.payment?.checkoutId?.source,
      accountId: this.payment?.checkoutId?.accountId,
    } as Order;
    const orderDocument = await this.simService.createOrder(orderPayload);
    this.payment['orderId'] = orderDocument;
  }

  private async createLineItems(): Promise<void> {
    const products = this.payment.variants;
    const totalProducts = products?.length;
    for (let i = 0; i < totalProducts; i++) {
      const productVariant = products[i];
      const lineItem = {
        orderId: this.payment.orderId,
        price: productVariant.price,
        productId: productVariant.productId,
        productVariantId: productVariant,
      };
      await this.simService.createLineItem(lineItem);
    }
  }

  private async updateOrder(): Promise<void> {
    await this.simService.updateOrder(this.payment.orderId, {
      simId: this.payment.simId,
    });
  }

  private async createSim(): Promise<void> {
    const sim = {
      countryFrom: this.payment.checkoutId.countryFrom,
      countryTravelTo: this.payment.checkoutId.countryTravelTo,
      customerId: this.payment.checkoutId.customerId,
      purchasedAt: dateNow('Date') as Date,
      simType: this.payment.checkoutId.simType === SimTypesEnum.pSIM ? SimTypesEnum.pSIM : SimTypesEnum.eSIM,
      status: SimStatusEnum.NotActive,
      serialNumber: this.payment?.serialNumber,
      isDoorDelivery: this.payment?.checkoutId.isDoorDelivery,
      flowName: this.payment?.checkoutId.flowName,
      accountId: this.payment?.checkoutId?.accountId,
      contactId: this.payment?.checkoutId?.contactId,
      dealId: this.payment?.checkoutId?.dealId,
      simId: this.payment?.checkoutId?.simId,
    };

    this.payment['simId'] = await this.simService.createSim(sim);
  }

  private async createSimActivity(queueResponse: object, productVariantId: ProductsVariant): Promise<void> {
    const simActivity = {
      productVariantId: productVariantId,
      queueId: queueResponse?.['MessageId'],
      simId: this.payment.simId,
    };

    this.event['simActivityId'] = await this.simService.createSimActivity(simActivity);
  }

  private async createSimPlans(): Promise<void> {
    const totalProducts = this.payment.variants;
    for (let variantIndex = 0; variantIndex < totalProducts?.length; variantIndex++) {
      const productVariant = totalProducts[variantIndex];

      const convertedDate = findAndConvertDate(this.payment.planStartDate);
      const simPlan = {
        productId: productVariant.productId,
        productVariantId: productVariant,
        isExpired: false,
        simId: this.payment.simId,
      };

      if (this.payment.validity && ProductNameEnum.SimValidity === productVariant.productId.name) {
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
      if (productPlans.includes(productVariant.productId.name)) {
        this.payment['simPlanPlan'] = simPlanDocument;
      } else if (ProductNameEnum.SimValidity === productVariant.productId.name) {
        this.payment['simPlanValidity'] = simPlanDocument;
      } else if (ProductNameEnum.AirTime === productVariant.productId.name) {
        this.payment['simPlanAirtime'] = simPlanDocument;
      }
    }
  }

  private async getSim(paymentDetails: PaymentDetails): Promise<void> {
    this.payment.simId = await this.simService.getSimById(paymentDetails.simId);
  }

  private async upsetSimPlan(): Promise<void> {
    const totalProducts = this.payment.variants;
    for (const element of totalProducts) {
      const productVariant = element;
      let simPlanDocument = await this.simService.getSimPlan(this.payment.simId, productVariant.productId, productVariant);
      let convertedDate = findAndConvertDate(this?.payment?.planStartDate);

      if (ProductNameEnum.SimValidity === productVariant.productId.name) {
        const latestSimValidity = (await this.simService.getSimPlanBySimId(this.payment.simId)).find(
          (variants) => variants.productId.name === ProductNameEnum.SimValidity
        );
        convertedDate = latestSimValidity.expiryDate;
      } else if (ProductNameEnum.AirTime === productVariant.productId.name) {
        convertedDate = dateNow('Date') as Date;
      }

      const simPlan = {
        startDate: addDayAndFormat(convertedDate, 0, 'date') as Date,
        expiryDate: addDayAndFormat(convertedDate, productVariant.validityPeriod, 'date') as Date,
        actionDate: minusOneDay(addDayAndFormat(convertedDate, productVariant.validityPeriod, 'date'), 'date') as Date,
        productId: productVariant.productId,
        productVariantId: productVariant,
        isExpired: false,
        simId: this.payment.simId,
      };

      if (!simPlanDocument) simPlanDocument = await this.simService.crateSimPlan(simPlan);
      else await this.simService.updateSimPlan(simPlanDocument, simPlan);

      if (productPlans.includes(productVariant.productId.name)) {
        this.payment.simPlanPlan = simPlanDocument;
      } else if (ProductNameEnum.SimValidity === productVariant.productId.name) {
        this.payment.simPlanValidity = simPlanDocument;
      } else if (ProductNameEnum.AirTime === productVariant.productId.name) {
        this.payment.simPlanAirtime = simPlanDocument;
      }
    }
  }

  private checkIsPlanStartDateToday(planStartDate: string): string {
    const isSameDate = checkIsSameDate(planStartDate); // If same as today date. Only add 30 minutes.
    const scheduleDateAndTime = isSameDate ? dateNow('Date') : minusOneDay(findAndConvertDate(planStartDate), 'date');
    return scheduleTimeWithThirtyMin(scheduleDateAndTime);
  }

  private async activationProcess(paymentDetails: PaymentDetails): Promise<void> {
    const totalProductVariants = this.payment.variants;

    const activationPayload = {
      simType: paymentDetails.simType,
      serialNumber: paymentDetails?.serialNumber,
      email: paymentDetails.email,
      whatsappNumber: paymentDetails.whatsappNumber,
      planStartDate: paymentDetails.planStartDate,
      checkoutId: this.payment?.['checkoutId'],
      parentFlowName: ParentWorkflow.Activation,
      simId: this.payment.simId,
      simPlanPlan: this.payment.simPlanPlan,
      simPlanAirtime: this.payment.simPlanAirtime,
      simPlanValidity: this.payment.simPlanValidity,
      plan: this.payment?.plan,
      device: paymentDetails.device,
    };

    for (let variantIndex = 0; variantIndex < totalProductVariants?.length; variantIndex++) {
      const variant = totalProductVariants[variantIndex];

      const isPlan = plans.includes(variant.name);
      const isValidity = validities.includes(variant.name);
      const isAirtime = airtime.includes(variant.name);

      if (isPlan) {
        const queue = await this.queueProcess(SQSTypes.workflow, activationPayload);
        await this.createSimActivity(queue, variant);
      }

      if (isValidity) {
        activationPayload['validity'] = this.payment.validity;
        activationPayload['date'] = this.payment.planStartDate;
        activationPayload['simExpireDate'] = findAndConvertDate(this.payment?.planStartDate);
        activationPayload['rechargeType'] = RechargeType.validity;
        activationPayload['amount'] = variant.price;
        activationPayload['productVariantId'] = variant;
        const scheduleDate = this.checkIsPlanStartDateToday(activationPayload.planStartDate);
        await this.scheduleClient.createEvent(activationPayload, RechargeType.validity, scheduleDate);
      }

      if (isAirtime) {
        activationPayload['airtime'] = this.payment.airtime;
        activationPayload['date'] = this.payment.planStartDate;
        activationPayload['simExpireDate'] = findAndConvertDate(this.payment?.planStartDate);
        activationPayload['rechargeType'] = RechargeType.airtime;
        activationPayload['amount'] = variant.price;
        activationPayload['productVariantId'] = variant;
        const scheduleDate = this.checkIsPlanStartDateToday(activationPayload.planStartDate);
        await this.scheduleClient.createEvent(activationPayload, RechargeType.validity, scheduleDate);
      }
    }
  }

  private async rechargeProcess(paymentDetails: PaymentDetails): Promise<void> {
    const rechargePayload = {
      simType: paymentDetails.simType,
      productsVariantId: paymentDetails.variants as ProductsVariant[] | ProductsVariant,
      planStartDate: paymentDetails.planStartDate,
      checkoutId: this.payment?.['checkoutId'],
      sim: this.payment.simId,
      date: null,
      airtime: null,
      validity: null,
      amount: 0,
      plan: null,
      rechargeType: null,
      totalPrice: paymentDetails.totalPrice,
      simExpireDate: null,
      simId: this.payment.simId,
    };

    const isValiditySelected = !!paymentDetails?.variants?.find((variant) => variant?.name === ProductVariantNameEnum.SimValidity)?.id;

    for (let i = 0; i < paymentDetails?.variants?.length; i++) {
      const variant = paymentDetails?.variants[i];

      const isPlan = plans.includes(variant.name);
      const isValidity = validities.includes(variant.name);
      const isAirtime = airtime.includes(variant.name);

      if (isPlan) {
        const date = findAndConvertDate(this.payment.planStartDate) as unknown as string;
        rechargePayload['productVariantId'] = variant;
        rechargePayload['plan'] = this.payment.plan;
        rechargePayload['planStartDate'] = date;
        rechargePayload['date'] = date;
        rechargePayload['simExpireDate'] = this.payment.simPlanPlan?.startDate;
        rechargePayload['rechargeType'] = RechargeType.plan;
        rechargePayload['amount'] = variant.price;
        rechargePayload['isValiditySelected'] = isValiditySelected;

        if (checkIsSameDate(this.payment.planStartDate)) {
          const queue = await this.queueProcess(SQSTypes.recharge, rechargePayload);
          await this.createSimActivity(queue, variant);
        } else {
          await this.scheduleClient.createEvent(
            rechargePayload,
            RechargeType.plan,
            scheduleTimeWithThirtyMin(findAndConvertDate(this.payment.planStartDate))
          );
        }
      }

      if (isValidity) {
        const simExpireDate = this.payment?.simPlanValidity?.startDate;
        rechargePayload['productVariantId'] = variant;
        rechargePayload['validity'] = this.payment.validity;
        rechargePayload['planStartDate'] = simExpireDate as unknown as string;
        rechargePayload['date'] = simExpireDate;
        rechargePayload['simExpireDate'] = simExpireDate;
        rechargePayload['rechargeType'] = RechargeType.validity;
        rechargePayload['amount'] = variant.price;

        const queue = await this.queueProcess(SQSTypes.recharge, rechargePayload); // If customer selected airtime for recharge we push to queue process the recharge.
        await this.createSimActivity(queue, variant);
      }

      if (isAirtime) {
        rechargePayload['productVariantId'] = variant;
        rechargePayload['airtime'] = this.payment.airtime;
        rechargePayload['planStartDate'] = dateNow('Date') as string;
        rechargePayload['date'] = dateNow('Date') as string;
        rechargePayload['simExpireDate'] = dateNow('Date') as string;
        rechargePayload['rechargeType'] = RechargeType.airtime;
        rechargePayload['amount'] = variant.price;
        rechargePayload['isValiditySelected'] = isValiditySelected;

        const queue = await this.queueProcess(SQSTypes.recharge, rechargePayload); // If customer selected airtime for recharge we push to queue process the recharge.
        await this.createSimActivity(queue, variant);
      }
    }
  }

  private async updateCheckout(): Promise<void> {
    const paid = this.paymentStatus === 'Completed';

    const updatePayload = {
      isPaid: paid,
      paidAt: paid ? (dateNow('Date') as Date) : null,
      completedAt: paid ? (dateNow('Date') as Date) : null,
      isCompleted: paid,
    };

    await this.simService.updateCheckoutById(this.payment.checkoutId, updatePayload);
  }

  async refreshToken(token: string): Promise<string> {
    const configures = (await this.simService.getConfigurations()).find((key) => key.option_name === configurationsEnum.peachToken);
    const updateTokenHour: number = new Date(configures?.updatedAt).getTime();
    const currentHour: number = (dateNow('Date') as Date).getTime();

    const timeDifferenceInMilliseconds = currentHour - updateTokenHour;

    const timeDifferenceInHours = timeDifferenceInMilliseconds / (1000 * 60 * 60);
    this.logger.info(`Time difference between current and token update: ${timeDifferenceInHours} hours`);
    /**
     * Token updated date lesser than current hours based on the platform.
     * Generator new Token and update in token record.
     */

    if (timeDifferenceInHours < 0 || timeDifferenceInHours > 2) {
      const paymentProvider: PaymentProvider = new PeachPayment();
      const process = new PaymentProcessor(paymentProvider);

      const updatedToken: {
        access_token: string;
        expires_in?: number;
      } = await process.auth();

      // eslint-disable-next-line no-undef
      if (!updatedToken?.access_token) throw new AppError('Unable to refresh token, Please try again later');

      const updateConfig = {
        option_name: configurationsEnum['peachToken'],
        option_value: updatedToken['access_token'],
        updatedAt: <Date>dateNow('Date'),
      };
      await this.simService.updateConfiguration(configures, updateConfig as Partial<Configuration>);

      return updatedToken?.access_token;
    }

    return token;
  }

  async createParcelOrder(): Promise<void> {
    const outBounds = this.shipmentClient.outBound();

    const address = await this.simService.getAddressByCustomer(this.payment.checkoutId.customerId);
    const customer = this.payment?.checkoutId?.customerId;
    const outBoundPayload: OutboundRequest = {
      clientId: `OutBoundId-${this.payment.checkoutId?.id}-${this.payment.simId?.id}`,
      typeId: OutboundType.outboundOrder,
      deliveryInfo: {
        addressLine1: address.address,
        contactNo: customer?.whatsapp,
        customer: getFullName(customer.firstName, customer?.lastName),
        postalCode: address?.postalCode,
        suburb: address?.province,
        addressLine2: address?.address,
        email: customer?.email,
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

    this.outBoundOrderId = await outBounds.create(outBoundPayload);
    await this.simService.updateSim(this.payment.simId?.id, { outBoundOrderId: this.outBoundOrderId });

    const crmPayloadEmail = {
      customerName: outBoundPayload.deliveryInfo?.customer,
      whatsappNumber: outBoundPayload.deliveryInfo?.contactNo || '',
      address: outBoundPayload.deliveryInfo?.addressLine1 || '',
      state: address?.province || '',
      suburb: address?.city || '',
      postalCode: outBoundPayload.deliveryInfo?.postalCode || '',
      action: Actions.Email,
      name: 'Delivery Order',
      email: 'delivery@nextsim.travel',
    };
    await this.queueProcess(SQSTypes.emailNotification, crmPayloadEmail, Templates.outBoundNotificationMail);
  }

  private async handleActivationProcess(paymentDetails: PaymentDetails): Promise<void> {
    await this.createSim();
    await this.updateOrder();
    await this.createSimPlans();

    if (this.payment.checkoutId?.isDoorDelivery) return await this.createParcelOrder();
    await this.activationProcess(paymentDetails);
  }

  private async handleRechargeProcess(paymentDetails: PaymentDetails): Promise<void> {
    await this.getSim(paymentDetails);
    await this.upsetSimPlan();
    await this.rechargeProcess(paymentDetails);
  }

  private async buildEmailParameters(paymentData: Payment, paymentDetails: PaymentDetails): Promise<any> {
    const lineItems = paymentDetails.variants;
    let serialNo = 0;
    const vatAmountCalculation = lineItems.map((lineItem) => {
      serialNo++;
      return calculateInvoiceAmount(lineItem, serialNo);
    });
    const invoiceAmount = buildLineItems(vatAmountCalculation);
    const address = await this.simService.getAddressByCustomer(this.payment.checkoutId.customerId);
    return {
      ...invoiceAmount,
      name: getFullName(this.payment.checkoutId.customerId.firstName, this.payment.checkoutId.customerId?.lastName),
      email: paymentDetails?.email,
      currency: paymentData.currency,
      invoiceDate: getCurrentDate(),
      whatsappNumber: paymentDetails.whatsappNumber,
      address: address?.address,
      invoiceNo: this.payment.checkoutId.dealId,
      stage: env('stage'),
    };
  }

  private async successPaymentNotification(paymentData: Payment, paymentDetails: PaymentDetails): Promise<void> {
    const doorDelivery =
      this.payment.checkoutId.countryFrom === Countries.Africa ? ProductVariantSkuEnum['doorDelivery-R99'] : ProductVariantSkuEnum['doorDelivery-$5'];
    const plan = formatVariants([
      { variant: paymentDetails?.plan as ProductVariantSkuEnum, type: ProductNameEnum.UnlimitedPlans },
      { variant: paymentDetails?.airtime as ProductVariantSkuEnum, type: ProductNameEnum.AirTime },
      { variant: paymentDetails?.validity as ProductVariantSkuEnum, type: ProductNameEnum.SimValidity },
      {
        variant: paymentDetails?.isDoorDelivery ? doorDelivery : null,
        type: ProductNameEnum.DoorDelivery,
      },
    ]);

    const templateName = paymentData.type === ParentWorkflow.Recharge ? Templates.sendRechargePaymentSuccess : Templates.sendPaymentSuccess;

    await this.queueProcess(
      SQSTypes.notification,
      {
        whatsappNumber: paymentDetails.whatsappNumber,
        email: paymentDetails?.email,
        action: Actions.Wati,
        totalPrice: `${CurrencySymbol[((paymentData?.currency as string) || 'R').toUpperCase()]}${paymentData?.totalPrice}`,
        planStartDate: paymentDetails?.planStartDate,
        simType: paymentDetails.simType === SimTypesEnum.pSIM ? SimType.pSIM : SimType.eSIM,
        plan: plan,
        date: dateNow(),
      },
      templateName
    );
  }

  private async handleCompletedPayment(paymentData: Payment, paymentDetails: PaymentDetails): Promise<void> {
    await this.successPaymentNotification(paymentData, paymentDetails);

    await this.createOrder();
    await this.createLineItems();

    const queueParams = await this.buildEmailParameters(paymentData, paymentDetails);
    await this.queueProcess(SQSTypes.invoicePdf, queueParams);

    if (this.payment.checkoutId.isCollectionPoint) {
      return await this.queueProcess(
        SQSTypes.notification,
        {
          whatsappNumber: paymentDetails.whatsappNumber,
          action: Actions.Wati,
        },
        Templates.collectionPoint
      );
    }

    if (this.payment.checkoutId.isDoorDelivery) {
      return await this.queueProcess(
        SQSTypes.notification,
        {
          whatsappNumber: paymentDetails.whatsappNumber,
          action: Actions.Wati,
        },
        Templates.doorDelivery
      );
    }

    if (paymentData.type === ParentWorkflow.Activation) await this.handleActivationProcess(paymentDetails);
    else if (paymentData.type === ParentWorkflow.Recharge) await this.handleRechargeProcess(paymentDetails);
  }

  private async crm(paymentData: Payment): Promise<void> {
    const crmPayload = {
      checkoutId: this.payment.checkoutId?.id as unknown as Checkout,
      flowName: CRMWorkFlow.Payment,
      paymentStatus: this.paymentStatus,
      isDoorDelivery: this.payment.checkoutId?.isDoorDelivery,
    };

    if (paymentData.type === ParentWorkflow.Recharge) crmPayload['simId'] = await this.simService.getSimById(paymentData?.simId);
    await this.queueProcess(SQSTypes.crm, crmPayload);
  }

  private invoiceBuild(billingTransactionDocument: Partial<BillingTransactions>): BillingTransactionInvoice {
    return {
      total_amount: billingTransactionDocument.amount,
      start_date: <string>dateNow('string'),
      end_date: <string>dateNow('string'),
      invoice: billingTransactionDocument.invoice,
      billing: [
        {
          date: <string>dateNow('string'),
          total_amount: billingTransactionDocument.amount,
          agents: [
            {
              name: billingTransactionDocument.account.name,
              count: billingTransactionDocument.totalSims,
              amount: billingTransactionDocument.amount,
            },
          ],
        },
      ],
      receiver: billingTransactionDocument.account.email,
      agent_name: billingTransactionDocument.account.name,
      address: billingTransactionDocument.account.address || '--',
      stage: env('stage'),
      hub_id: billingTransactionDocument.account.hubspotUserId,
      vat_no: billingTransactionDocument.account.vatNumber || '--',
      type: 'afterPayment',
      currency: RegionBasedCurrency[billingTransactionDocument.account.zone],
    };
  }

  public async partnerTermPayment(invoiceId: string, status: PaymentStatus): Promise<void> {
    const billingTransactionDocument = await this.simService.getBillingTransactionByInvoiceId(invoiceId);

    if (status === 'Completed' && billingTransactionDocument.currentPlan === PlanType.COD) {
      const invoiceQueueParams = this.invoiceBuild(billingTransactionDocument);
      await this.queueProcess(SQSTypes.billingInvoice, invoiceQueueParams);

      const salesService = new Sales();
      await salesService.queue(JSON.parse(billingTransactionDocument.sims), billingTransactionDocument.account, false);
    }

    await this.pushToQueue(SQSTypes.crm, {
      invoiceId: billingTransactionDocument.invoice,
      action: PartnerTermAction.update,
      status: status,
      flowName: CRMWorkFlow.PartnerTerm,
    });
  }

  public async paymentProperties(): Promise<Payment> {
    let paymentProp: unknown;
    if (!this.isStripe) {
      const oldAccessToken = (await this.configService.getValue('peachToken')) as string;
      const newAccessToken = await this.refreshToken(oldAccessToken);
      const paymentProvider: PaymentProvider = new PeachPayment(newAccessToken);
      const process = new PaymentProcessor(paymentProvider);

      paymentProp = await process.getPaymentById(this.event.paymentId);
    } else {
      paymentProp = this.event;
    }

    return paymentBuild(this.provider, paymentProp);
  }

  async paymentHandler(): Promise<void> {
    try {
      await this.simService.ormInit();
      const paymentData = await this.paymentProperties();

      // For partner term planStartDate is keyword for identify
      if ((paymentData?.checkoutId as unknown as string) === 'Partner-Terms')
        return await this.partnerTermPayment(paymentData?.planStartDate as unknown as string, this.paymentStatus);

      const paymentDetails: PaymentDetails = await this.getPaymentDetails(paymentData);

      const isPaid = this.paymentStatus === 'Completed';
      const isFailed = this.paymentStatus === 'Expired' || this.paymentStatus === 'Failed';

      await this.crm(paymentData);
      if (isPaid || isFailed) await this.updateCheckout();

      if (this.payment?.checkoutId?.isDoorDelivery && isPaid) {
        const crmPayload = {
          checkoutId: this.payment.checkoutId?.id as unknown as Checkout,
          flowName: CRMWorkFlow.parcelNinja,
          isDoorDelivery: true,
          outBoundOrderId: this.outBoundOrderId,
        };
        await this.queueProcess(SQSTypes.crm, crmPayload);
      }

      const notificationParams = {
        whatsappNumber: paymentDetails.whatsappNumber,
        email: paymentDetails?.email,
        action: Actions.Wati,
        date: dateNow(),
      };

      if (isFailed) {
        const templateName = this.paymentStatus === 'Expired' ? Templates.paymentExpired : Templates.paymentFailed;
        return await this.queueProcess(SQSTypes.notification, notificationParams, templateName);
      }

      if (isPaid) await this.handleCompletedPayment(paymentData, paymentDetails);
    } catch (e) {
      this.logger.error(e);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async webhookHandler(_signature?: string): Promise<void> {
    try {
      // const isVerifiedEvent = await this.paymentProcess.verifyWebhook(this.rawEvent, _signature);
      // if (!isVerifiedEvent) throw new AppError('Webhook Error', 200); // TODO: Need to verify
      await this.queueProcess(SQSTypes.payment, this.rawEvent);
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
