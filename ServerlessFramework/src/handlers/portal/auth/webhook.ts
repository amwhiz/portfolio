import { WorkflowBase } from '@handlers/webhook-wati/workflows/pushToQueue';
import { AuthWebhook, IWebhook } from './interfaces/webhook';
import { AppError } from '@libs/api-error';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { SQSTypes } from 'src/constants/sqs';
import { KeyType } from '@aw/env';
import { Role } from 'src/entities/enums/account';
import { ConfigurationService } from 'src/configurations/configService';
import { HubspotIds } from 'src/types/configuration';
import { buildAccountParams } from 'src/helpers/buildAccountProperties';
import { PartnerTermUpdateType } from '../sales/types/partnerTerm';

export class AuthWebhookService extends WorkflowBase implements AuthWebhook {
  private hubspotWebhookSQS: KeyType = SQSTypes.hubspot;
  private configureService: ConfigurationService;

  constructor() {
    super();
    this.configureService = ConfigurationService.getInstance();
  }

  private async getRole(id: string): Promise<Role> {
    const hubspotIds = (await this.configureService.getValue('hubspotIds')) as HubspotIds;
    switch (id) {
      case `${hubspotIds['Agency_ObjectTypeId']}`:
        return Role.AGENCY;
      case `${hubspotIds['userAgent_objectTypeId']}`:
        return Role.USER_AGENT;
      case `${hubspotIds['Partner_ObjectTypeId']}`:
        return Role.PARTNER;
      default:
        throw new AppError(ReasonPhrases.NOT_FOUND, StatusCodes.OK);
    }
  }

  async webhook(webhook: IWebhook): Promise<void> {
    if (webhook?.['properties']?.hs_object_source?.value !== 'CRM_UI' && webhook?.['properties']?.hs_object_source?.value !== 'FORM') return null;

    const email = webhook.properties?.email?.value ?? webhook.properties?.company_email?.value;
    if (!email) throw new AppError(ReasonPhrases.NOT_FOUND, StatusCodes.OK);

    const role = await this.getRole(String(webhook.objectTypeId));
    const accountProp = buildAccountParams(email, role, webhook);

    await this.queueProcess(this.hubspotWebhookSQS, accountProp);
  }

  async accountRoleUpdateWebhook(webhook: PartnerTermUpdateType): Promise<void> {
    if (!webhook?.email) throw new AppError(ReasonPhrases.NOT_FOUND, StatusCodes.OK);
    this.hubspotWebhookSQS = SQSTypes.accountPlanUpdate;

    await this.queueProcess(this.hubspotWebhookSQS, webhook);
  }

  async queueProcess(queueType: KeyType, payload: object = {}): Promise<void> {
    await super.pushToQueue(queueType, {
      ...payload,
    });
    await super.delay(1000);
  }
}
