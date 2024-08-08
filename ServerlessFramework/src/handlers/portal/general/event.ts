import { handlerPath } from '@libs/handler-resolver';
import { AWSFunction } from '@libs/lambda';
import { corsConfig } from '../auth/event';

export const general = {
  // eslint-disable-next-line no-undef
  handler: `${handlerPath(__dirname)}/handler.general`,
  events: [
    {
      http: {
        method: 'get',
        path: 'general',
        authorizer: {
          name: 'gatewayAuthorizer',
        },
        cors: corsConfig,
      },
    },
  ],
} as AWSFunction;
