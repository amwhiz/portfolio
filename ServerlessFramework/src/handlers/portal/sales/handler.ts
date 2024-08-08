/* eslint-disable @typescript-eslint/no-explicit-any */
import { APIGatewayProxyEvent, SQSHandler } from 'aws-lambda';
import { getAccountFromAuthorizer } from '../userManagement/handler';
import Sales from './sales';
import { middyfy } from '@libs/lambda';
import { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { FormValidator, SerialValidate } from './schemas/forms';
import { IFormsWebhook } from './interfaces/sales';
import { AppError } from '@libs/api-error';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { Role } from 'src/entities/enums/account';
import SimPurchaseService from './simPurchase/simPurchaseStatus';
import { IWebhook } from '../auth/interfaces/webhook';
import { simPurchaseValidator } from './schemas/simPurchase';
import { SimPurchase } from 'src/entities';
import { CODService } from './partnerTerm/cod';

const simAndTopupWebhook: ValidatedEventAPIGatewayProxyEvent<typeof FormValidator> = async (event): Promise<any> => {
  const parentAccount = getAccountFromAuthorizer(event as unknown as APIGatewayProxyEvent);
  if (parentAccount.role === Role.PARTNER) throw new AppError(ReasonPhrases.FORBIDDEN, StatusCodes.FORBIDDEN);

  const salesService = new Sales();
  const response = await salesService.queue(event?.body as unknown as IFormsWebhook, parentAccount);
  return { data: response };
};

const saleValidates: ValidatedEventAPIGatewayProxyEvent<typeof SerialValidate> = async (event): Promise<any> => {
  const salesService = new Sales();
  const response = await salesService.serialNumberValidate(event?.body);
  return response;
};

const simAndTopupWorker: SQSHandler = async (event): Promise<any> => {
  const body: unknown = event.Records[0].body;
  // const body: unknown = event?.['body'];
  const salesService = new Sales();
  await salesService.dispatchForm(body as IFormsWebhook);
  return { data: 'Success' };
};

const getPurchasedSimByCustomers = async (event: APIGatewayProxyEvent): Promise<any> => {
  const customerEmail = event.queryStringParameters?.email;

  const salesService = new Sales();
  const response = await salesService.simPurchasedByCustomer(customerEmail);
  return { data: response };
};

const simPurchaseOrderStatusWebhooks = async (event: APIGatewayProxyEvent): Promise<any> => {
  const body: unknown = event.body;
  const simPurchaseService = new SimPurchaseService();
  await simPurchaseService.queue(body as IWebhook);
};

const simPurchaseOrderStatusWorkers: SQSHandler = async (event): Promise<any> => {
  const body: unknown = event.Records[0].body;
  // const body: unknown = event?.['body'];
  const simPurchaseService = new SimPurchaseService();
  await simPurchaseService.simPurchaseStatusUpdate(body);
};

const getSimPurchaseByAccounts = async (event: APIGatewayProxyEvent): Promise<any> => {
  const email = event.requestContext?.authorizer?.['email'];
  const simPurchaseService = new SimPurchaseService();
  const response = await simPurchaseService.getSimPurchase(email, event?.queryStringParameters as any);
  return { data: response };
};

const simPurchases: ValidatedEventAPIGatewayProxyEvent<typeof simPurchaseValidator> = async (event): Promise<any> => {
  const email = event.requestContext?.authorizer?.['email'];
  const body = event?.body;

  const simPurchaseService = new SimPurchaseService();
  const response = await simPurchaseService.simPurchase(email, body as unknown as Partial<SimPurchase>);
  return { data: response };
};

const billingTransactionsStatus = async (event: APIGatewayProxyEvent): Promise<any> => {
  const { invoiceId } = event.queryStringParameters;
  const codService = new CODService();
  const response = await codService.billingTransactionStatus(invoiceId);
  return { data: response };
};

export const saleValidate = middyfy(saleValidates, true);
export const saleWebhook = middyfy(simAndTopupWebhook, true);
export const saleWorker = middyfy(simAndTopupWorker);
export const getPurchasedSimByCustomer = middyfy(getPurchasedSimByCustomers);
export const simPurchaseOrderStatusWebhook = middyfy(simPurchaseOrderStatusWebhooks);
export const simPurchaseOrderStatusWorker = middyfy(simPurchaseOrderStatusWorkers);
export const getSimPurchaseByAccount = middyfy(getSimPurchaseByAccounts);
export const simPurchase = middyfy(simPurchases);
export const billingTransactionStatus = middyfy(billingTransactionsStatus);
