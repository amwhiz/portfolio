import AccountService from '@handlers/account/account';
import { CRMProcessor } from '@aw/crm';
import { HubspotCRM } from '@aw/crm/crm/aw-hubspot';
import { AssociationService } from '@aw/crm/interfaces/crmServices';
import { env } from '@aw/env';
import { ConfigurationService } from 'src/configurations/configService';
import { HubspotIds } from 'src/types/configuration';
import { AssociationSpec } from '@aw/crm/crm/aw-hubspot/services/association.service';
import { Accounts } from 'src/entities';
import { Operation } from '@handlers/portal/userManagement/enums/operations';
import { Role } from 'src/entities/enums/account';
import { AssociationSpecAssociationCategoryEnum } from '@aw/crm/crm/aw-hubspot/types/responseType';
import { WorkflowBase } from '@handlers/webhook-wati/workflows/pushToQueue';
import { IAssociationBuilder } from './interfaces/builders';

export class CRMAssociation {
  public async buildPayload(builder: IAssociationBuilder): Promise<void> {
    await builder.setDefaultProperties();
    await builder.setAssociation();
  }
}

export class CRMAssociationPayload {
  fromObjectId?: string;
  toObjectId?: string;
  fromObjectType?: string;
  toObjectType?: string;
  associationSpec?: AssociationSpec[];
  parentAccount: Partial<Accounts>;
  childAccount: Partial<Accounts>;
  type: Operation;
}

export class CRMAssociationBuilder extends WorkflowBase implements IAssociationBuilder {
  private crmClient: CRMProcessor;
  private accountService: AccountService;
  private associationService: AssociationService;
  private configService: ConfigurationService;
  private hubspotObjectIds: HubspotIds;
  private payload: CRMAssociationPayload;

  constructor(payload: CRMAssociationPayload) {
    super();
    this.payload = payload;
    const provider = new HubspotCRM({
      accessToken: env('hubspotToken'),
    });
    this.crmClient = new CRMProcessor(provider);
    this.associationService = this.crmClient.association();
    this.configService = ConfigurationService.getInstance();
    this.accountService = new AccountService();
  }

  async setDefaultProperties(): Promise<void> {
    if (!(this.payload?.parentAccount?.role === Role.PARTNER && this.payload?.childAccount?.role === Role.USER_AGENT)) {
      this.hubspotObjectIds = (await this.configService.getValue('hubspotIds')) as HubspotIds;
      super.delay(2000);
      await this.accountService.ormInit();

      const objectTypeId = {
        [Role.AGENCY as string]: this.hubspotObjectIds.agency,
        [Role.PARTNER as string]: this.hubspotObjectIds.partner,
        [Role.USER_AGENT as string]: this.hubspotObjectIds.userAgent,
      };

      const associationObjectTypeId = {
        [Role.AGENCY as string]: this.hubspotObjectIds.Agency_to_userAgent,
        [Role.PARTNER as string]: this.hubspotObjectIds.Agency_to_partner,
      };

      const fromObject = await this.accountService.findAccountByUniqueColumn(this.payload?.parentAccount?.email);
      const toObject = await this.accountService.findAccountByUniqueColumn(this.payload?.childAccount?.email);

      this.payload = {
        fromObjectId: fromObject.hubspotUserId,
        toObjectId: toObject.hubspotUserId,
        fromObjectType: objectTypeId[fromObject.role],
        toObjectType: objectTypeId[toObject.role],
        associationSpec: [
          {
            associationCategory: AssociationSpecAssociationCategoryEnum['UserDefined'],
            associationTypeId: associationObjectTypeId[fromObject.role],
          },
        ],
        parentAccount: this.payload.parentAccount,
        childAccount: this.payload.childAccount,
        type: this.payload.type,
      };
    }
  }

  async setAssociation(): Promise<void> {
    if (!(this.payload?.parentAccount?.role === Role.PARTNER && this.payload?.childAccount?.role === Role.USER_AGENT)) {
      if (this.payload.type === Operation.CREATE)
        await this.associationService.create(
          this.payload.fromObjectType,
          this.payload.fromObjectId,
          this.payload.toObjectType,
          this.payload.toObjectId,
          this.payload.associationSpec
        );
      else if (this.payload.type === Operation.DELETE)
        await this.associationService.delete(
          this.payload.fromObjectType,
          this.payload.fromObjectId,
          this.payload.toObjectType,
          this.payload.toObjectId
        );
    }
  }
}
