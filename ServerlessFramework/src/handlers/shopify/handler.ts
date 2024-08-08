/* eslint-disable @typescript-eslint/no-explicit-any */
import { middyfy } from '@libs/lambda';
import { APIGatewayProxyEvent, SQSHandler } from 'aws-lambda';
import { ShopifyBuilder, ShopifyBuySim, ShopifyWebhook } from './service';
import { OrderData } from './interfaces/order';

const shopifyWebhooks = async (event: APIGatewayProxyEvent): Promise<any> => {
  const shopifyWebhook = new ShopifyWebhook(event?.body);
  await shopifyWebhook.webhook();
  return { data: 'success' };
};

const shopifyWorkers: SQSHandler = async (event): Promise<void> => {
  // const body: OrderData | any = event?.['body'];
  const body: OrderData | any = event.Records[0].body;
  const shopifyBuild = new ShopifyBuySim();
  await shopifyBuild.buildPayload<OrderData>(new ShopifyBuilder(), body);
};

export const shopifyWebhook = middyfy(shopifyWebhooks);
export const shopifyWorker = middyfy(shopifyWorkers);
