/* eslint-disable no-undef */
import { handlerPath } from '@libs/handler-resolver';
import { AWSFunction } from '@libs/lambda';

export const crm = {
  handler: `${handlerPath(__dirname)}/handler.crm`,
  events: [
    {
      sqs: {
        arn: {
          'Fn::GetAtt': ['crmQueue', 'Arn'],
        },
        batchSize: 1,
      },
    },
  ],
  timeout: 120,
} as AWSFunction;
