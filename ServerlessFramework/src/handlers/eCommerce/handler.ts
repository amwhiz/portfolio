/* eslint-disable @typescript-eslint/no-explicit-any */
import { middyfy } from '@libs/lambda';
import { APIGatewayProxyEvent, SQSHandler } from 'aws-lambda';
import { OrderData } from './interfaces/order';
import { ECommerceWebhook, ECommerceBuySim, ECommerceBuilder } from './service';
import CustomerReferralService from './referral/referral';
import { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { simValidator } from './schemas/sims';
import ShopifyRechargeExecutive, { RechargeBuilderService, ShopifyRecharge } from './topup/topup';
import { RechargePayloadType } from './types/recharge';
import { CheckoutPayload } from '@handlers/checkout';
import { OrderType } from 'src/entities/enums/order';

const eCommerceWebhooks = async (event: APIGatewayProxyEvent): Promise<any> => {
  const eCommerceWebhook = new ECommerceWebhook();
  await eCommerceWebhook.webhook(event?.body);
  return { data: 'success' };
};

const eCommerceWorkers: SQSHandler = async (event): Promise<void> => {
  const body: OrderData | any = event.Records[0].body;
  const eCommerceBuild = new ECommerceBuySim();
  await eCommerceBuild.buildPayload<OrderData>(new ECommerceBuilder(), body);
};

const whoIam = async (event: APIGatewayProxyEvent): Promise<any> => {
  const customerEmail = event.queryStringParameters?.email;

  const eCommerceWebhook = new ECommerceWebhook();
  const response = await eCommerceWebhook.me(customerEmail);
  return { data: response };
};

const activationsWorker: ValidatedEventAPIGatewayProxyEvent<typeof simValidator> = async (event): Promise<any> => {
  const body: any = event?.body;
  const eCommerceWebhook = new ECommerceWebhook();

  const activatedSim = await eCommerceWebhook.activationExecutive(body);
  return { data: activatedSim };
};

const getSimsByEmail: ValidatedEventAPIGatewayProxyEvent<typeof simValidator> = async (event): Promise<any> => {
  const body: any = event?.body;
  const eCommerceWebhook = new ECommerceWebhook();
  const sims = await eCommerceWebhook.getSimsByEmail(body);
  return { data: sims };
};

const simUsagesWorker: ValidatedEventAPIGatewayProxyEvent<typeof simValidator> = async (event): Promise<any> => {
  const body: any = event?.body;
  const eCommerceWebhook = new ECommerceWebhook();

  const response = await eCommerceWebhook.simUsageExecutive(body);
  return { data: response };
};

const updateSims: ValidatedEventAPIGatewayProxyEvent<typeof simValidator> = async (event): Promise<any> => {
  const body: any = event?.body;

  const eCommerceWebhook = new ECommerceWebhook();
  await eCommerceWebhook.updateSimName(body);
  return { data: 'Success' };
};

const customerReferral = async (event: APIGatewayProxyEvent): Promise<any> => {
  const customerId = event?.queryStringParameters?.customerId;
  const customerReferralService = new CustomerReferralService(+customerId);

  const response = await customerReferralService.getReferralData();
  return { data: response };
};

const eCommerceRechargeWorkers: SQSHandler = async (event): Promise<void> => {
  const body: any = event.Records[0].body;
  if (body?.['type'] === OrderType.Recharge) {
    const rechargeService = new ShopifyRecharge();
    await rechargeService.buildPayload(new RechargeBuilderService(), body as unknown as CheckoutPayload & RechargePayloadType);
  } else {
    const rechargeExecutive = new ShopifyRechargeExecutive();
    await rechargeExecutive.doRecharge(body);
  }
};

export const eCommerceWebhook = middyfy(eCommerceWebhooks);
export const eCommerceWorker = middyfy(eCommerceWorkers);
export const activationWorker = middyfy(activationsWorker);
export const getSimsByCustomerEmail = middyfy(getSimsByEmail, true);
export const simUsageWorker = middyfy(simUsagesWorker);
export const updateSim = middyfy(updateSims);
export const fetchCurrentUser = middyfy(whoIam);
export const getCustomerReferral = middyfy(customerReferral);
export const eCommerceRechargeWorker = middyfy(eCommerceRechargeWorkers);
