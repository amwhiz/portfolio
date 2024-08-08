import { HubspotAccount } from './interfaces/account';
import { CRMProcessor } from '@aw/crm';
import { HubspotCRM } from '@aw/crm/crm/aw-hubspot';
import { CustomObjectService } from '@aw/crm/interfaces/crmServices';
import { env } from '@aw/env';
import { ConfigurationService } from 'src/configurations/configService';
import { HubspotIds } from 'src/types/configuration';
import { Accounts } from 'src/entities';
import { Role, ZONE } from 'src/entities/enums/account';
import { returnYesOrNo } from 'src/helpers/returnBoolean';
import { FilterOperatorEnum, PublicObjectSearchRequest } from '@aw/crm/crm/aw-hubspot/services/customObject.service';
import AccountService from '@handlers/account/account';
import { selectedProperties } from 'src/helpers/selectedProperties';
import { AgencyProperties, PartnerProperties, userAgentProperties } from './constants/accountProperties';
import { IAccountBuilder } from './interfaces/builders';

export class CRMAccount {
  public async buildPayload(builder: IAccountBuilder): Promise<void> {
    await builder.setDefaultProperties();
    await builder.upsertAccount();
  }
}

export class CRMAccountPayload {
  account: Partial<Accounts>;
  accountsDivisionContacts2Nd: string;
  accountsDivisionContacts: string;
  numberOfBranches?: number;
  numberOfUsers?: number;
  itDivisionContact?: string;
}

export class CRMAccountBuilder implements IAccountBuilder {
  private crmClient: CRMProcessor;
  private accountService: AccountService;
  private customObjectService: CustomObjectService;
  private configService: ConfigurationService;
  private accountObjectTypeId: string;
  private hubspotObjectIds: HubspotIds;
  private hubspotAccountPayload: HubspotAccount;
  private payload: CRMAccountPayload;

  constructor(payload: CRMAccountPayload) {
    this.payload = payload;
    const provider = new HubspotCRM({
      accessToken: env('hubspotToken'),
    });
    this.crmClient = new CRMProcessor(provider);
    this.customObjectService = this.crmClient.customObject();
    this.configService = ConfigurationService.getInstance();
    this.accountService = new AccountService();
  }

  async setDefaultProperties(): Promise<void> {
    this.hubspotObjectIds = (await this.configService.getValue('hubspotIds')) as HubspotIds;

    const objectTypeId = {
      [Role.AGENCY as string]: this.hubspotObjectIds.agency,
      [Role.PARTNER as string]: this.hubspotObjectIds.partner,
      [Role.USER_AGENT as string]: this.hubspotObjectIds.userAgent,
    };
    this.accountObjectTypeId = objectTypeId[this.payload.account.role];

    const hubspotProperties = {
      partner_term: this.payload?.account.currentPlan,
      market_sector_category: this.payload?.account?.marketSector,
      partner_level: this.payload?.account?.partnerLevel,
      region: this.payload?.account?.region,
      address: this.payload?.account?.address,
      whatsapp: this.payload?.account?.whatsapp,
      billing: returnYesOrNo(this.payload?.account?.isBilling),
      marketing: returnYesOrNo(this.payload?.account?.isMarketing),
      company_registration: this.payload?.account?.registrationNumber,
      commission__: `${this.payload?.account?.commission || 0}`,
      email: this.payload?.account?.email,
      name: this.payload?.account?.name,
      vat_number: this.payload?.account?.vatNumber,
      partner_code: this.payload?.account?.referralCode,
      accounts_division_contacts__2nd_: this.payload?.accountsDivisionContacts2Nd,
      accounts_division_contacts: this.payload?.accountsDivisionContacts,
      number_of_branches: this.payload?.numberOfBranches,
      number_of_users: this.payload?.numberOfUsers,
      it_division_contact: this.payload?.itDivisionContact,
      zone: ZONE[this.payload?.account?.zone],
    };

    const objectTypeProperties = {
      [Role.AGENCY as string]: AgencyProperties,
      [Role.PARTNER as string]: PartnerProperties,
      [Role.USER_AGENT as string]: userAgentProperties,
    };

    this.hubspotAccountPayload = selectedProperties(hubspotProperties, objectTypeProperties[this.payload.account.role]);
  }

  private getFilter(
    operator: FilterOperatorEnum,
    propertyName: keyof typeof this.hubspotAccountPayload,
    value: string
  ): PublicObjectSearchRequest['filterGroups'][0]['filters'][0] {
    return {
      operator: operator,
      propertyName: propertyName,
      value: value,
    };
  }

  private async searchAccount(): Promise<HubspotAccount & { id: string }> {
    const searchProp: PublicObjectSearchRequest = {
      filterGroups: [
        {
          filters: [this.getFilter(FilterOperatorEnum.Eq, 'email', this.hubspotAccountPayload.email)],
        },
        {
          filters: [this.getFilter(FilterOperatorEnum.Eq, 'partner_code', this.hubspotAccountPayload.partner_code)],
        },
      ],
      limit: 1,
      properties: Object.keys(this.hubspotAccountPayload),
      after: undefined,
      sorts: undefined,
      query: undefined,
    };

    const response = await this.customObjectService.search<HubspotAccount & { id: string }>(this.accountObjectTypeId, searchProp);
    return response;
  }

  async upsertAccount(): Promise<void> {
    await this.accountService.ormInit();

    const isExists = await this.searchAccount();
    let hubspotId: string = '';

    if (isExists?.id) {
      hubspotId = isExists.id;
      await this.customObjectService.update(this.accountObjectTypeId, isExists?.id, {
        ...selectedProperties(isExists, Object.keys(this.hubspotAccountPayload)),
        ...this.hubspotAccountPayload,
      });
    } else {
      const response = await this.customObjectService.create(this.accountObjectTypeId, this.hubspotAccountPayload, undefined);
      hubspotId = response?.['id'];
    }
    await this.accountService.upsertAccount({ ...this.payload.account, hubspotUserId: hubspotId });

    await this.accountService.closeConnection();
  }
}
