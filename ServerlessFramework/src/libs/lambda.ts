/* eslint-disable @typescript-eslint/no-explicit-any */
import middy, { MiddyfiedHandler } from '@middy/core';
import type { AWS } from '@serverless/typescript';
import { injectLambda, logger } from '@aw/logger';
import { customJsonBodyParserMiddleware } from 'src/middleware/customJsonBodyParser';
import { apiGatewayResponseMiddleware } from 'src/middleware/apiGatewayResponse.middleware';
import { transformInterceptor } from 'src/interceptors/transform';
import { insertLogMiddleware } from 'src/middleware/insertLog.middleware';

export const middyfy = (handler: any, canUseInterceptor: boolean = false): MiddyfiedHandler =>
  middy(handler)
    .use(insertLogMiddleware())
    .use(
      apiGatewayResponseMiddleware({
        enableErrorLogger: false,
      })
    )
    .use(injectLambda(logger))
    .use(customJsonBodyParserMiddleware())
    .use(transformInterceptor(canUseInterceptor));

// AWSFunction type
export type AWSFunction = AWS['functions'][0];
