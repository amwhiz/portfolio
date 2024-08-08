import { IWebhook } from '@handlers/portal/auth/interfaces/webhook';
import { Accounts } from 'src/entities';
import { Role, PlanType, ZONE } from 'src/entities/enums/account';
import { dateNow } from './dates';
import { returnBoolean, SelectedOptions } from './returnBoolean';
import { returnNumber } from './returnNumber';

export const buildAccountParams = (email: string, role: Role, account: IWebhook): Partial<Accounts> => ({
  name: account.properties?.name?.value,
  role,
  hubspotUserId: `${account?.objectId}`,
  whatsapp: account.properties?.whatsapp?.value,
  address: account.properties?.address?.value ?? account.properties?.location?.value,
  currentPlan: account?.properties?.partner_term?.value as PlanType,
  isBilling: returnBoolean(<SelectedOptions>account?.properties?.billing?.value),
  isMarketing: returnBoolean(<SelectedOptions>account?.properties?.marketing?.value),
  marketSector: account?.properties?.market_sector_category?.value,
  partnerLevel: account?.properties?.partner_level?.value,
  region: account?.properties?.region?.value,
  registrationNumber: account?.properties?.company_registration?.value,
  commission: returnNumber(account?.properties?.commission__?.value),
  vatNumber: account?.properties?.vat_number?.value,
  email: email,
  createdAt: <Date>dateNow('Date'),
  updatedAt: <Date>dateNow('Date'),
  zone: ZONE[account.properties?.zone?.value] as unknown as ZONE,
});
