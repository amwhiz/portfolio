/* eslint-disable no-undef */
import { handlerPath } from '@libs/handler-resolver';
import { AWSFunction } from '@libs/lambda';

export const notification = {
  handler: `${handlerPath(__dirname)}/handler.notification`,
  events: [
    {
      sqs: {
        arn: {
          'Fn::GetAtt': ['notificationQueue', 'Arn'],
        },
        batchSize: 1,
      },
    },
  ],
  timeout: 120,
} as AWSFunction;

export const emailNotification = {
  handler: `${handlerPath(__dirname)}/handler.notification`,
  events: [
    {
      sqs: {
        arn: {
          'Fn::GetAtt': ['emailNotificationQueue', 'Arn'],
        },
        batchSize: 1,
      },
    },
  ],
  timeout: 120,
} as AWSFunction;
