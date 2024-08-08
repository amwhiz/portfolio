import { handlerPath } from '@libs/handler-resolver';
import { AWSFunction } from '@libs/lambda';

export const commission = {
  // eslint-disable-next-line no-undef
  handler: `${handlerPath(__dirname)}/handler.commission`,
  events: [
    {
      sqs: {
        arn: {
          'Fn::GetAtt': ['commissionQueue', 'Arn'],
        },
        batchSize: 1,
      },
    },
  ],
  timeout: 120,
} as AWSFunction;
