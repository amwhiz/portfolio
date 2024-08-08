/* eslint-disable require-await */
/* eslint-disable @typescript-eslint/no-explicit-any */
import middy from '@middy/core';
import MiddlewareFunction = middy.MiddlewareFn;
import { APIGatewayProxyEvent, SQSEvent, SQSHandler } from 'aws-lambda';
import { LoggerService } from '@aw/logger';

export const customJsonBodyParserMiddleware = (): any => {
  const before: MiddlewareFunction<APIGatewayProxyEvent, SQSHandler, any> = async (handler) => {
    const logger = new LoggerService({ serviceName: customJsonBodyParserMiddleware.name });
    logger.info('----Requested Headers----', { body: handler?.event?.headers });
    if (handler?.event?.headers?.['Content-Type'] || handler.event.headers?.['content-type']) {
      const contentType = handler?.event?.headers?.['Content-Type'] ?? handler.event.headers?.['content-type'];
      // Handle only JSON content types
      if (contentType?.startsWith('application/json')) {
        logger.info('----Requested Body----', { body: handler?.event?.body });
        // Parse the JSON body manually
        handler.event.body = JSON.parse(handler?.event?.body || '{}');
      }
    } else if ((handler?.event as unknown as SQSEvent)['Records']?.length) {
      logger.info('----Requested Body----', { body: (handler?.event as unknown as SQSEvent)['Records'][0].body });
      // Parse the SQS JSON body manually
      (handler?.event as unknown as SQSEvent)['Records'][0].body = JSON.parse((handler?.event as unknown as SQSEvent)['Records'][0].body);
    } else if ((handler?.event as unknown as { schedule: boolean })?.['schedule']) {
      handler.event['body'] = handler?.event as unknown as string;
      logger.info('----Requested Body----', { body: handler?.event?.body });
    }
  };

  return {
    before,
  };
};
