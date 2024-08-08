/* eslint-disable no-undef */
import { handlerPath } from '@libs/handler-resolver';
import { AWSFunction } from '@libs/lambda';
import { corsConfig } from '../auth/event';
import { FormValidator, SerialValidate } from './schemas/forms';
import { simPurchaseValidator } from './schemas/simPurchase';

const sales = 'sales';

export const saleWebhook = {
  handler: `${handlerPath(__dirname)}/handler.saleWebhook`,
  events: [
    {
      http: {
        method: 'post',
        path: `${sales}`,
        request: {
          schemas: {
            'application/json': FormValidator,
          },
        },
        authorizer: {
          name: 'gatewayAuthorizer',
        },
        cors: corsConfig,
      },
    },
  ],
  timeout: 30,
} as AWSFunction;

export const saleWorker = {
  handler: `${handlerPath(__dirname)}/handler.saleWorker`,
  events: [
    {
      sqs: {
        arn: {
          'Fn::GetAtt': ['portalQueue', 'Arn'],
        },
        batchSize: 1,
      },
    },
  ],
  timeout: 30,
} as AWSFunction;

export const getPurchasedSimByCustomer = {
  handler: `${handlerPath(__dirname)}/handler.getPurchasedSimByCustomer`,
  events: [
    {
      http: {
        method: 'get',
        path: `${sales}/sim-purchase/customer`,
        request: {
          parameters: {
            querystrings: {
              email: true,
            },
          },
        },
        authorizer: {
          name: 'gatewayAuthorizer',
        },
        cors: corsConfig,
      },
    },
  ],
  timeout: 30,
} as AWSFunction;

export const simPurchaseOrderStatusWebhook = {
  handler: `${handlerPath(__dirname)}/handler.simPurchaseOrderStatusWebhook`,
  events: [
    {
      http: {
        method: 'post',
        path: `${sales}/sim-purchase/status`,
        authorizer: {
          name: 'hubspotGatewayAuthorizer',
          type: 'request',
          identitySource: 'method.request.header.Authorization',
        },
      },
    },
  ],
} as AWSFunction;

export const simPurchaseOrderStatusWorker = {
  handler: `${handlerPath(__dirname)}/handler.simPurchaseOrderStatusWorker`,
  events: [
    {
      sqs: {
        arn: {
          'Fn::GetAtt': ['simPurchaseQueue', 'Arn'],
        },
        batchSize: 1,
      },
    },
  ],
  timeout: 30,
} as AWSFunction;

export const simPurchase = {
  handler: `${handlerPath(__dirname)}/handler.simPurchase`,
  events: [
    {
      http: {
        method: 'post',
        path: `${sales}/sim-purchase`,
        request: {
          schemas: {
            'application/json': simPurchaseValidator,
          },
        },
        authorizer: {
          name: 'gatewayAuthorizer',
        },
        cors: corsConfig,
      },
    },
  ],
} as AWSFunction;

export const getSimPurchaseByAccount = {
  handler: `${handlerPath(__dirname)}/handler.getSimPurchaseByAccount`,
  events: [
    {
      http: {
        method: 'get',
        path: `${sales}/sim-purchase`,
        request: {
          parameters: {
            querystrings: {
              limit: true,
              page: true,
            },
          },
        },
        authorizer: {
          name: 'gatewayAuthorizer',
        },
        cors: corsConfig,
      },
    },
  ],
} as AWSFunction;

export const billingTransactionStatus = {
  handler: `${handlerPath(__dirname)}/handler.billingTransactionStatus`,
  events: [
    {
      http: {
        method: 'get',
        path: `${sales}/status`,
        request: {
          parameters: {
            querystrings: {
              invoiceId: true,
            },
          },
        },
        authorizer: {
          name: 'gatewayAuthorizer',
        },
        cors: corsConfig,
      },
    },
  ],
} as AWSFunction;

export const saleValidate = {
  handler: `${handlerPath(__dirname)}/handler.saleValidate`,
  events: [
    {
      http: {
        method: 'post',
        path: `${sales}/validate`,
        request: {
          schemas: {
            'application/json': SerialValidate,
          },
        },
        authorizer: {
          name: 'gatewayAuthorizer',
        },
        cors: corsConfig,
      },
    },
  ],
  timeout: 30,
} as AWSFunction;
