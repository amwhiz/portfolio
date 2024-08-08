/* eslint-disable no-undef */
import { handlerPath } from '@libs/handler-resolver';
import { AWSFunction } from '@libs/lambda';

const path = 'thirdparty';

export const thirdPartyWebhook = {
  handler: `${handlerPath(__dirname)}/handler.thirdPartyWebhook`,
  events: [
    {
      http: {
        method: 'post',
        path: `/${path}/webhook`,
      },
    },
  ],
} as AWSFunction;

export const thirdPartyWorker = {
  handler: `${handlerPath(__dirname)}/handler.thirdPartyWorker`,
  events: [
    {
      sqs: {
        arn: {
          'Fn::GetAtt': ['thirdPartyQueue', 'Arn'],
        },
        batchSize: 1,
      },
    },
  ],
  timeout: 30,
} as AWSFunction;
