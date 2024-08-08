/* eslint-disable require-await */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { PolicyType, allowPolicy, denyAllPolicy } from 'src/policy/policy';
import { verifyToken } from 'src/utils/jwt';
import { AuthorizerType, authorizerTokenType } from '../auth/interfaces/authorizer';
import { Role, ZONE } from 'src/entities/enums/account';

export const authorizer = async (event: authorizerTokenType): Promise<PolicyType> => {
  const token = event?.authorizationToken?.split('Bearer ').length ? event?.authorizationToken?.split('Bearer ')[1] : null;

  try {
    const data: AuthorizerType = verifyToken(<string>token) as AuthorizerType;
    const account: AuthorizerType = {
      email: data?.email ?? '',
      hubspotUserId: data?.hubspotUserId ?? '',
      role: data?.role ?? ('' as Role),
      zone: data?.zone ?? ('' as unknown as ZONE),
    };

    return allowPolicy(event.methodArn, account);
  } catch (e: any) {
    return denyAllPolicy();
  }
};
