import { AuthorizerType } from '@handlers/portal/auth/interfaces/authorizer';
import { PolicyDocument } from 'aws-lambda';

export type PolicyType = { principalId: string; policyDocument: PolicyDocument; context?: AuthorizerType };

export const denyAllPolicy = (): PolicyType => ({
  principalId: '*',
  policyDocument: {
    Version: '2012-10-17',
    Statement: [
      {
        Action: '*',
        Effect: 'Deny',
        Resource: '*',
      },
    ],
  },
});

export const allowPolicy = (methodArn: string, account: AuthorizerType = {}): PolicyType => ({
  principalId: 'apigateway.amazonaws.com',
  policyDocument: {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'execute-api:Invoke',
        Effect: 'Allow',
        Resource: methodArn,
      },
    ],
  },
  context: {
    ...account,
  },
});
