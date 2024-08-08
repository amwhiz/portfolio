import { Role, ZONE } from 'src/entities/enums/account';

export type authorizerTokenType = {
  authorizationToken?: string;
  type: string;
  methodArn: string;
  headers?: {
    Authorization?: string;
  };
};

export type AuthorizerType = {
  hubspotUserId?: string;
  email?: string;
  role?: Role;
  zone?: ZONE;
};
