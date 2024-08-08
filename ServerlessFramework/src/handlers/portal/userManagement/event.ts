/* eslint-disable no-undef */
import { handlerPath } from '@libs/handler-resolver';
import { AWSFunction } from '@libs/lambda';
import { corsConfig } from '../auth/event';
import { createRoleBasedEntityValidator } from './schemas/userManagement';

const userManagement = 'user-management';

export const getAgencies = {
  handler: `${handlerPath(__dirname)}/handler.getAgencies`,
  events: [
    {
      http: {
        method: 'get',
        path: `${userManagement}/agencies`,
        authorizer: {
          name: 'gatewayAuthorizer',
        },
        cors: corsConfig,
      },
    },
  ],
} as AWSFunction;

export const getUserAgents = {
  handler: `${handlerPath(__dirname)}/handler.getUserAgents`,
  events: [
    {
      http: {
        method: 'get',
        path: `${userManagement}/useragents`,
        authorizer: {
          name: 'gatewayAuthorizer',
        },
        cors: corsConfig,
      },
    },
  ],
} as AWSFunction;

export const createRoleBasedEntities = {
  handler: `${handlerPath(__dirname)}/handler.createRoleBasedEntities`,
  events: [
    {
      http: {
        method: 'post',
        path: `${userManagement}/accounts`,
        request: {
          schemas: {
            'application/json': createRoleBasedEntityValidator,
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
