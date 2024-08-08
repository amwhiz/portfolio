/* eslint-disable no-undef */
import { handlerPath } from '@libs/handler-resolver';
import { AWSFunction } from '@libs/lambda';

export const paymentWebhook = {
  handler: `${handlerPath(__dirname)}/handler.paymentWebhook`,
  events: [
    {
      http: {
        method: 'post',
        path: '/payment/webhook',
      },
    },
  ],
} as AWSFunction;

export const paymentWorker = {
  handler: `${handlerPath(__dirname)}/handler.paymentWorker`,
  events: [
    {
      sqs: {
        arn: {
          'Fn::GetAtt': ['paymentQueue', 'Arn'],
        },
        batchSize: 1,
      },
    },
  ],
  timeout: 120,
} as AWSFunction;
