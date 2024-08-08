/* eslint-disable require-await */
/* eslint-disable @typescript-eslint/no-explicit-any */
import middy from '@middy/core';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { sendResponse } from '@libs/api-gateway';
import { AppError } from '@libs/api-error';
import MiddlewareFunction = middy.MiddlewareFn;

/**
 * Creates middleware for handling API Gateway responses and errors.
 */
export const apiGatewayResponseMiddleware = (options: { enableErrorLogger?: boolean } = {}): any => {
  const after: MiddlewareFunction<APIGatewayProxyEvent, any> = async (request) => {
    if (!request.event?.httpMethod || !request?.response) {
      return;
    }

    const existingKeys = Object.keys(request.response);
    const isHttpResponse = existingKeys.includes('statusCode') && existingKeys.includes('headers') && existingKeys.includes('body');

    if (isHttpResponse) {
      return;
    }

    request.response = sendResponse({ data: request.response?.data }, request.response?.statusCode, request?.response?.headers);
  };

  const onError: MiddlewareFunction<APIGatewayProxyEvent, APIGatewayProxyResult> = async (request) => {
    const { error } = request;
    let statusCode = 500;

    if (error instanceof AppError) {
      // when throw error from application middleware catch and log it
      statusCode = error.statusCode;
    }

    if (options.enableErrorLogger) {
      // eslint-disable-next-line no-console
      console.error(`${JSON.stringify(error?.message)}`);
    }

    request.response = sendResponse({ error: { message: error?.message, status: statusCode } }, statusCode) as APIGatewayProxyResult;
  };

  return {
    after,
    onError,
  };
};
