/* eslint-disable no-undef */
import { handlerPath } from '@libs/handler-resolver';
import { AWSFunction } from '@libs/lambda';
import { loginValidator } from './schemas/login';
import { resetPasswordValidator } from './schemas/resetPassword';

const authPath = 'auth';

export const corsConfig = {
  origins: ['https://partners.nextsim.travel', 'https://dev.partners.nextsim.travel', 'http://localhost:8080'],
};

export const gatewayAuthorizer = {
  handler: `${handlerPath(__dirname)}/handler.gatewayAuthorizer`,
};

export const hubspotGatewayAuthorizer = {
  handler: `${handlerPath(__dirname)}/handler.hubspotGatewayAuthorizer`,
};

export const hubspotRegisterWebhook = {
  handler: `${handlerPath(__dirname)}/handler.hubspotRegisterWebhook`,
  events: [
    {
      http: {
        method: 'post',
        path: 'hubspot/register',
        authorizer: {
          name: 'hubspotGatewayAuthorizer',
          type: 'request',
          identitySource: 'method.request.header.Authorization',
        },
      },
    },
  ],
} as AWSFunction;

export const register = {
  handler: `${handlerPath(__dirname)}/handler.register`,
  events: [
    {
      sqs: {
        arn: {
          'Fn::GetAtt': ['hubspotWorkflowQueue', 'Arn'],
        },
        batchSize: 1,
      },
    },
  ],
} as AWSFunction;

export const me = {
  handler: `${handlerPath(__dirname)}/handler.me`,
  events: [
    {
      http: {
        method: 'get',
        path: `${authPath}/me`,
        authorizer: {
          name: 'gatewayAuthorizer',
        },
        cors: corsConfig,
      },
    },
  ],
} as AWSFunction;

export const login = {
  handler: `${handlerPath(__dirname)}/handler.login`,
  events: [
    {
      http: {
        method: 'post',
        path: `${authPath}/login`,
        request: {
          schemas: {
            'application/json': loginValidator,
          },
        },
        cors: corsConfig,
      },
    },
  ],
} as AWSFunction;

export const resetPassword = {
  handler: `${handlerPath(__dirname)}/handler.resetPassword`,
  events: [
    {
      http: {
        method: 'post',
        path: `${authPath}/reset-password`,
        request: {
          schemas: {
            'application/json': resetPasswordValidator,
          },
        },
        cors: corsConfig,
      },
    },
  ],
} as AWSFunction;

export const updateAccount = {
  handler: `${handlerPath(__dirname)}/handler.updateAccount`,
  events: [
    {
      http: {
        method: 'post',
        path: `${authPath}/update`,
      },
    },
  ],
} as AWSFunction;

export const updateAccountPlan = {
  handler: `${handlerPath(__dirname)}/handler.updateAccountPlan`,
  events: [
    {
      http: {
        method: 'post',
        path: `${authPath}/update/plan`,
        authorizer: {
          name: 'hubspotGatewayAuthorizer',
          type: 'request',
          identitySource: 'method.request.header.Authorization',
        },
      },
    },
  ],
} as AWSFunction;

export const logout = {
  handler: `${handlerPath(__dirname)}/handler.logout`,
  events: [
    {
      http: {
        method: 'get',
        path: `${authPath}/logout`,
        authorizer: {
          name: 'gatewayAuthorizer',
        },
        cors: corsConfig,
      },
    },
  ],
} as AWSFunction;
