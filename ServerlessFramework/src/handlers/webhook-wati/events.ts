/* eslint-disable no-undef */
import { handlerPath } from '@libs/handler-resolver';
import { AWSFunction } from '@libs/lambda';
import { workflowValidator } from '../webhook-wati/schemas/workflow';

export const workflowWebhook = {
  handler: `${handlerPath(__dirname)}/handler.workflowWebhook`,
  events: [
    {
      http: {
        method: 'post',
        path: '/workflow/webhook',
        request: {
          schemas: {
            'application/json': workflowValidator,
          },
        },
      },
    },
  ],
} as AWSFunction;

export const workflowWorker = {
  handler: `${handlerPath(__dirname)}/handler.workflowWorker`,
  events: [
    {
      sqs: {
        arn: {
          'Fn::GetAtt': ['workflowQueue', 'Arn'],
        },
        batchSize: 1,
      },
    },
  ],
  timeout: 60,
} as AWSFunction;

export const activationExecutiveWorker = {
  handler: `${handlerPath(__dirname)}/handler.activationExecutiveWorker`,
  events: [
    {
      sqs: {
        arn: {
          'Fn::GetAtt': ['activationExecutiveQueue', 'Arn'],
        },
        batchSize: 1,
      },
    },
  ],
  timeout: 120,
} as AWSFunction;

export const rechargeExecutiveWorker = {
  handler: `${handlerPath(__dirname)}/handler.rechargeExecutiveWorker`,
  events: [
    {
      sqs: {
        arn: {
          'Fn::GetAtt': ['rechargeExecutiveQueue', 'Arn'],
        },
        batchSize: 1,
      },
    },
  ],
  timeout: 120,
} as AWSFunction;

export const scheduleWebhook = {
  handler: `${handlerPath(__dirname)}/handler.scheduleWebhook`,
  events: [
    {
      http: {
        method: 'post',
        path: '/scheduler/webhook',
      },
    },
  ],
  timeout: 30,
} as AWSFunction;
