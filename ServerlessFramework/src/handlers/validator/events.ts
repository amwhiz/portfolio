/* eslint-disable no-undef */
import { handlerPath } from '@libs/handler-resolver';
import { AWSFunction } from '@libs/lambda';
import { validatorSchema } from './schema/validator';

export const validator = {
  handler: `${handlerPath(__dirname)}/handler.validator`,
  events: [
    {
      http: {
        method: 'post',
        path: '/validate',
        request: {
          schemas: {
            'application/json': validatorSchema,
          },
        },
      },
    },
  ],
  timeout: 30,
} as AWSFunction;
