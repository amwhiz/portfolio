/* eslint-disable no-undef */
import { handlerPath } from '@libs/handler-resolver';
import { AWSFunction } from '@libs/lambda';

const path = 'shopify';

export const shopifyWebhook = {
  handler: `${handlerPath(__dirname)}/handler.shopifyWebhook`,
  events: [
    {
      http: {
        method: 'post',
        path: `/${path}/webhook`,
      },
    },
  ],
} as AWSFunction;

export const shopifyWorker = {
  handler: `${handlerPath(__dirname)}/handler.shopifyWorker`,
  events: [
    {
      sqs: {
        arn: {
          'Fn::GetAtt': ['shopifyQueue', 'Arn'],
        },
        batchSize: 1,
      },
    },
  ],
  timeout: 30,
} as AWSFunction;
