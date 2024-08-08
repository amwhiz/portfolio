/* eslint-disable @typescript-eslint/no-explicit-any */
export interface AuthWebhook {
  webhook(webhook: IWebhook): Promise<void>;
}

export interface IWebhook {
  objectId: number;
  objectType: string;
  objectTypeId: string;
  properties: IProperties;
}

interface VersionAndValue {
  value: string;
  version: [] | any;
}

interface IProperties {
  name?: VersionAndValue;
  email?: VersionAndValue;
  hs_object_source: VersionAndValue;
  company_email?: VersionAndValue;
  dealname?: VersionAndValue;
  dealstage?: VersionAndValue;
  whatsapp?: VersionAndValue;
  address?: VersionAndValue;
  partner_term?: VersionAndValue;
  vat_number?: VersionAndValue;
  location?: VersionAndValue;
  billing?: VersionAndValue;
  marketing?: VersionAndValue;
  market_sector_category?: VersionAndValue;
  partner_level?: VersionAndValue;
  region?: VersionAndValue;
  company_registration?: VersionAndValue;
  commission__?: VersionAndValue;
  zone?: VersionAndValue;
}
