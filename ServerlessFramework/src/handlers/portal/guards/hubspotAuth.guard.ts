/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PolicyType, allowPolicy, denyAllPolicy } from 'src/policy/policy';
import { authorizerTokenType } from '../auth/interfaces/authorizer';
import { env } from '@aw/env';

// eslint-disable-next-line require-await
export const hubspotAuthorizer = async (event: authorizerTokenType): Promise<PolicyType> => {
  const secret = event?.headers?.Authorization?.split('Bearer ').length ? event?.headers?.Authorization?.split('Bearer ')[1] : null;

  if (secret === <string>env('hubspotSecret')) return allowPolicy(event.methodArn);
  else return denyAllPolicy();
};
