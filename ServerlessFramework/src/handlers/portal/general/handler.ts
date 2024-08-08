/* eslint-disable @typescript-eslint/no-explicit-any */
import { APIGatewayProxyEvent } from 'aws-lambda';
import { GeneralService } from './service';
import { middyfy } from '@libs/lambda';

const generals = async (event: APIGatewayProxyEvent): Promise<any> => {
  const zone = event?.requestContext?.authorizer?.['zone'];

  const generalService = new GeneralService(zone);
  const response = await generalService.general();

  return { data: response };
};

export const general = middyfy(generals);
