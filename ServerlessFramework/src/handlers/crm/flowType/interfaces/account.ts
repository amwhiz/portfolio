import { PlanType } from 'src/entities/enums/account';

export interface IBase {
  name?: string;
  email?: string;
  whatsapp?: string;
  address?: string;
  partner_code?: string;
}

export interface HubspotAccount extends IBase {
  vat_number?: string;
  company_registration?: string;
  accounts_division_contacts?: string;
  accounts_division_contacts__2nd_?: string;
  market_sector_category?: string;
  number_of_branches?: string;
  number_of_users?: string;
  region?: string;
  partner_level?: string;
  partner_term?: PlanType;
  commission__?: string;
  marketing?: string;
  billing?: string;
  it_division_contact?: string;
  marketing_division_contact?: string;
  location?: string;
}
