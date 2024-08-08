/* eslint-disable no-undef */
import { handlerPath } from '@libs/handler-resolver';
import { AWSFunction } from '@libs/lambda';

const path = 'shopify/ecommerce';

export const corsConfig = {
  origins: ['https://shop.nextsim.travel', 'https://dev-4c6ed84adf7f3a43b70d.o2.myshopify.dev', 'http://localhost:8080'],
};

export const eCommerceWebhook = {
  handler: `${handlerPath(__dirname)}/handler.eCommerceWebhook`,
  events: [
    {
      http: {
        method: 'post',
        path: `/${path}/webhook`,
        cors: corsConfig,
      },
    },
  ],
} as AWSFunction;

export const eCommerceWorker = {
  handler: `${handlerPath(__dirname)}/handler.eCommerceWorker`,
  events: [
    {
      sqs: {
        arn: {
          'Fn::GetAtt': ['eCommerceQueue', 'Arn'],
        },
        batchSize: 1,
      },
    },
  ],
  timeout: 30,
} as AWSFunction;

export const fetchCurrentUser = {
  handler: `${handlerPath(__dirname)}/handler.fetchCurrentUser`,
  events: [
    {
      http: {
        method: 'get',
        path: `/${path}/me`,
        request: {
          parameters: {
            querystrings: {
              email: true,
            },
          },
        },
        cors: corsConfig,
      },
    },
  ],
} as AWSFunction;

export const activationWorker = {
  handler: `${handlerPath(__dirname)}/handler.activationWorker`,
  events: [
    {
      http: {
        method: 'post',
        path: `/${path}/sims/activate`,
        cors: corsConfig,
      },
    },
  ],
  timeout: 30,
} as AWSFunction;

export const getSimsByCustomerEmail = {
  handler: `${handlerPath(__dirname)}/handler.getSimsByCustomerEmail`,
  events: [
    {
      http: {
        method: 'post',
        path: `/${path}/sims`,
        cors: corsConfig,
      },
    },
  ],
} as AWSFunction;

export const simUsageWorker = {
  handler: `${handlerPath(__dirname)}/handler.simUsageWorker`,
  events: [
    {
      http: {
        method: 'post',
        path: `/${path}/sims/usage`,
        cors: corsConfig,
      },
    },
  ],
} as AWSFunction;

export const updateSim = {
  handler: `${handlerPath(__dirname)}/handler.updateSim`,
  events: [
    {
      http: {
        method: 'post',
        path: `/${path}/sims/update`,
        cors: corsConfig,
      },
    },
  ],
} as AWSFunction;

export const getCustomerReferral = {
  handler: `${handlerPath(__dirname)}/handler.getCustomerReferral`,
  events: [
    {
      http: {
        method: 'get',
        path: `/${path}/customer/referral`,
        request: {
          parameters: {
            querystrings: {
              customerId: true,
            },
          },
        },
        cors: corsConfig,
      },
    },
  ],
  timeout: 120,
} as AWSFunction;

export const eCommerceRechargeWorker = {
  handler: `${handlerPath(__dirname)}/handler.eCommerceRechargeWorker`,
  events: [
    {
      sqs: {
        arn: {
          'Fn::GetAtt': ['eCommerceRechargeQueue', 'Arn'],
        },
        batchSize: 1,
      },
    },
  ],
  timeout: 30,
} as AWSFunction;
