/* eslint-disable require-await */
/* eslint-disable @typescript-eslint/no-explicit-any */
import middy from '@middy/core';
import MiddlewareFunction = middy.MiddlewareFn;
import { APIGatewayProxyEvent } from 'aws-lambda';
import { LoggerService } from '@aw/logger';
import { transformBody } from 'src/helpers/transform';

export const transformInterceptor = (canUseInterceptor: boolean): any => {
  const before: MiddlewareFunction<APIGatewayProxyEvent, any> = async (handler) => {
    const logger = new LoggerService({ serviceName: transformInterceptor.name });

    const body = handler?.event?.body;
    // No need interceptor for all handler
    if (!canUseInterceptor) return;
    handler.event.body = await transformBody(body);
    logger.info('----Transformed Body----', { body: handler?.event?.body });
  };

  return {
    before,
  };
};
