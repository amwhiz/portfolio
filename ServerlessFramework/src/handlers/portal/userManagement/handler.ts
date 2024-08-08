/* eslint-disable @typescript-eslint/no-explicit-any */
import { APIGatewayProxyEvent } from 'aws-lambda';
import { UserManagementService } from './service';
import { Accounts } from 'src/entities';
import { middyfy } from '@libs/lambda';
import { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { createRoleBasedEntityValidator } from './schemas/userManagement';
import { Operation } from './enums/operations';
import { AuthorizerType } from '../auth/interfaces/authorizer';

export const getAccountFromAuthorizer = (event: APIGatewayProxyEvent): AuthorizerType => ({
  email: event.requestContext?.authorizer?.['email'],
  role: event.requestContext?.authorizer?.['role'],
  hubspotUserId: event.requestContext?.authorizer?.['hubspotUserId'],
});

const listAgencies = async (event: APIGatewayProxyEvent): Promise<any> => {
  const parentAccount = getAccountFromAuthorizer(event);

  const { limit, offset } = event?.queryStringParameters as { limit: string; offset: string };
  const userManagement = new UserManagementService();
  const response: Partial<Partial<Accounts>[]> = await userManagement.getAgencies(parentAccount, limit, offset);
  return { data: response };
};

const listUserAgents = async (event: APIGatewayProxyEvent): Promise<any> => {
  const parentAccount = getAccountFromAuthorizer(event);

  const { limit, offset } = event?.queryStringParameters as { limit: string; offset: string };
  const userManagement = new UserManagementService();
  const response: Partial<Partial<Accounts>[]> = await userManagement.getUserAgents(parentAccount, limit, offset);
  return { data: response };
};

const createRoleBasedEntity: ValidatedEventAPIGatewayProxyEvent<typeof createRoleBasedEntityValidator> = async (event): Promise<any> => {
  const parentAccount = getAccountFromAuthorizer(event as any as APIGatewayProxyEvent);

  const { account, operation } = event.body;
  const userManagement = new UserManagementService();
  const response: string = await userManagement.createRoleBasedEntity(parentAccount, <any>account, <Operation>operation);
  return { data: response };
};

export const getAgencies = middyfy(listAgencies);
export const getUserAgents = middyfy(listUserAgents);
export const createRoleBasedEntities = middyfy(createRoleBasedEntity, true);
