/* eslint-disable require-await */
/* eslint-disable @typescript-eslint/no-explicit-any */
import middy from '@middy/core';
import MiddlewareFunction = middy.MiddlewareFn;
import { APIGatewayProxyEvent } from 'aws-lambda';
import { LogAttributes } from '@aw/logger/interfaces/log';
import { safeStringify } from '@aw/libs';
import DynamoDBClient from '@aw/dynamodb';
import { LogsEntity } from '@aw/logger/entity/log';
import { getUrlFromRequest } from 'src/helpers/getUrl';
import { LoggerService } from '@aw/logger';

export const insertInboundLogs = (handler: APIGatewayProxyEvent): void => {
  const { body, headers, httpMethod } = handler;
  const url = getUrlFromRequest(handler);
  const dynamoDBClient = new DynamoDBClient();
  let type: LogAttributes['EventType'];

  if (body?.['parentFlowName']) type = 'Chatbot';
  else if (headers?.['origin']?.includes('nextsim.travel') || body?.['EventName']) type = 'Portal';
  else if (headers?.['X-Shopify-Api-Version']) type = 'Shopify';
  else type = 'Portal';

  const insertLog: LogAttributes = {
    pk: 'logs',
    sk: `${new Date().getTime()}`,
    TemplateName: '',
    Method: httpMethod,
    RequestPayload: safeStringify((JSON.parse(body ?? '{}') as unknown as object) || {}),
    RequestTime: 0,
    ResponseTime: 0,
    TotalTime: 0,
    Response: safeStringify({}),
    StatusCode: 200,
    type: 'Inbound',
    EventType: type,
    Url: url,
  };

  dynamoDBClient.put<LogAttributes>(LogsEntity, insertLog).catch((e) => {
    console.error('Error inserting log into DynamoDB:', e);
  });
};

export const insertLogMiddleware = (): any => {
  const logger = new LoggerService({ serviceName: insertLogMiddleware.name });
  const before: MiddlewareFunction<APIGatewayProxyEvent, any> = (handler) => {
    logger.info('Logger');
    if (handler?.event?.headers?.['Content-Type'] || handler.event.headers?.['content-type']) {
      const contentType = handler?.event?.headers?.['Content-Type'] ?? handler.event.headers?.['content-type'];
      if (contentType?.startsWith('application/json')) {
        insertInboundLogs(handler?.event);
      }
    }
  };

  return {
    before,
  };
};
