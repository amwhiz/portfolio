/* eslint-disable @typescript-eslint/no-explicit-any */
import { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { billingValidator } from './schemas/billing';
import BillingService from './services';
import { IBilling } from './interfaces/billing';

// Billing
const billing: ValidatedEventAPIGatewayProxyEvent<typeof billingValidator> = async (event): Promise<any> => {
  const email = event.requestContext?.authorizer?.['email'];

  const billingServie = new BillingService(event?.body as IBilling, email);

  const response = await billingServie.generateAgentInvoice();
  return { data: response };
};

export const getAgencyBilling = middyfy(billing);
