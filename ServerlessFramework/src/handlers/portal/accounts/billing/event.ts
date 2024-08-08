/* eslint-disable no-undef */
import { handlerPath } from '@libs/handler-resolver';
import { AWSFunction } from '@libs/lambda';

export const corsConfig = {
  origins: ['https://partners.nextsim.travel', 'https://dev.partners.nextsim.travel', 'http://localhost:8080'],
};

export const getAgencyBilling = {
  handler: `${handlerPath(__dirname)}/handler.getAgencyBilling`,
  events: [
    {
      http: {
        method: 'post',
        path: '/billing/agency',
        authorizer: {
          name: 'gatewayAuthorizer',
        },
        cors: corsConfig,
      },
    },
  ],
} as AWSFunction;
