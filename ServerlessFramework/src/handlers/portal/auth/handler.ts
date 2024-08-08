/* eslint-disable require-await */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { APIGatewayProxyEvent, SQSEvent } from 'aws-lambda';
import { AuthService } from './services';
import { StatusCodes } from 'http-status-codes';
import { Accounts } from 'src/entities/account';
import { middyfy } from '@libs/lambda';
import { generateToken } from 'src/utils/jwt';
import { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { loginValidator } from './schemas/login';
import { AccountRelationShip } from './interfaces/account';
import { resetPasswordValidator } from './schemas/resetPassword';
import { authorizer } from '../guards/auth.guard';
import { StatusResponse } from '../types/response';
import { webhookValidator } from './schemas/webhook';
import { AuthWebhookService } from './webhook';
import { IWebhook } from './interfaces/webhook';
import { hubspotAuthorizer } from '../guards/hubspotAuth.guard';

const getToken = async (event: any, record: Partial<Accounts>): Promise<string> => {
  const rememberMe = event.body['rememberMe'] ? '7d' : '15d';
  const token = generateToken({ email: record.email, hubspotUserId: record.hubspotUserId, role: record.role, zone: record.zone }, rememberMe);

  return token;
};

const hubspotWebhook: ValidatedEventAPIGatewayProxyEvent<typeof webhookValidator> = async (event): Promise<any> => {
  const authWebhookService = new AuthWebhookService();
  await authWebhookService.webhook(event.body as unknown as IWebhook);
  return { statusCode: StatusCodes.OK };
};

const signUp = async (event: SQSEvent): Promise<StatusResponse> => {
  const sqsRecords: string = event.Records[0].body;
  // const sqsRecords: string = event?.['body'];
  const authService = new AuthService();
  await authService.register(sqsRecords as unknown as Accounts);
  return { statusCode: StatusCodes.NO_CONTENT };
};

const signIn: ValidatedEventAPIGatewayProxyEvent<typeof loginValidator> = async (event): Promise<any> => {
  const authService = new AuthService();
  const response: Partial<Accounts> = await authService.login(event?.body as unknown as Accounts);
  const token = await getToken(event, response);
  response['token'] = token;

  return { data: response };
};

const whoIam = async (event: APIGatewayProxyEvent): Promise<{ data: AccountRelationShip }> => {
  const body = {
    email: event.requestContext?.authorizer?.['email'],
    role: event.requestContext?.authorizer?.['role'],
  };
  const authService = new AuthService();
  const response = await authService.me(body as unknown as Accounts);
  return { data: response };
};

const forgotPassword: ValidatedEventAPIGatewayProxyEvent<typeof resetPasswordValidator> = async (event): Promise<any> => {
  const authService = new AuthService();
  const response = await authService.resetPassword(event?.body as unknown as Accounts);
  return { data: response };
};

const updateAccounts: ValidatedEventAPIGatewayProxyEvent<typeof Accounts> = async (event): Promise<any> => {
  const authService = new AuthService();
  const response = await authService.updateAccount(event?.body as Partial<Accounts>);
  return { data: response };
};

const updateAccountPlans: ValidatedEventAPIGatewayProxyEvent<typeof Accounts> = async (event): Promise<any> => {
  const authService = new AuthService();
  const response = await authService.updateAccountPlan(event?.body as Partial<Accounts>);
  return { data: response };
};

const signOut = async (event: APIGatewayProxyEvent): Promise<StatusResponse> => {
  const body = {
    email: event.requestContext?.authorizer?.['email'],
    role: event.requestContext?.authorizer?.['role'],
  };
  const authService = new AuthService();
  await authService.logout(body as Partial<Accounts>);
  return { statusCode: StatusCodes.NO_CONTENT };
};

export const hubspotRegisterWebhook = middyfy(hubspotWebhook);
export const register = middyfy(signUp);
export const login = middyfy(signIn);
export const me = middyfy(whoIam);
export const resetPassword = middyfy(forgotPassword);
export const updateAccount = middyfy(updateAccounts);
export const updateAccountPlan = middyfy(updateAccountPlans);
export const logout = middyfy(signOut);
export const gatewayAuthorizer = authorizer;
export const hubspotGatewayAuthorizer = hubspotAuthorizer;
