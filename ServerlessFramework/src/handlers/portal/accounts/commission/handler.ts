/* eslint-disable @typescript-eslint/no-explicit-any */
import { middyfy } from '@libs/lambda';
import { CommissionService, CommissionServicesBuilder } from './services';
import { APIGatewayProxyEvent } from 'aws-lambda';

// Billing
const commission = async (event: APIGatewayProxyEvent): Promise<any> => {
  const email = event.requestContext?.authorizer?.['email'];
  const payload = {
    startDate: event.queryStringParameters?.['startDate'],
    endDate: event.queryStringParameters?.['endDate'],
    email,
  };

  const commissionService = new CommissionServicesBuilder();
  const response = await commissionService.buildPayload(new CommissionService(), payload);
  return { data: response };
};

export const getAgencyCommission = middyfy(commission);
