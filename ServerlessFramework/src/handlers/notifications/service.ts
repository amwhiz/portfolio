import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { Template } from 'src/entities';
import { Notification } from './types/notification';
import { ContentType, SendType } from 'src/entities/enums/template';
import { buildJsonSchema } from 'src/build/jsonSchema';
import { ObjectMapper } from '@aw/objectmapper';
import { stringFormat } from 'src/helpers/getStringTemplate';
import { Actions } from 'src/enums/actions';
import WatiClient from '@aw/wati';
import { MessageRequestType, TemplateParams } from '@aw/wati/types/message';
import { MessageType } from '@aw/wati/enums/messageType';
import { AppError } from '@libs/api-error';
import { ormInstance } from 'src/configurations/mikroOrm';
import { MailProcessor } from '@aw/mail';
import { BodyMessageRequestType } from '@aw/mail/interfaces/bodyMessageRequest';
import { ConfigurationService } from 'src/configurations/configService';
import { Templates } from 'src/constants/templates';

export default class NotificationService {
  private EntityManager: EntityManager;
  private templateEntity: EntityRepository<Template>;
  private watiClient: WatiClient;
  private initOrm = ormInstance;
  private mailClient: MailProcessor;
  private configService: ConfigurationService;
  private fromAddress: string;
  private senderName: string;
  private bccAddress1: string;
  private bccAddress2: string;
  private bccAddress3: string;
  private bccAddress4: string;

  constructor() {
    this.watiClient = new WatiClient();
    this.configService = ConfigurationService.getInstance();
    this.mailClient = new MailProcessor();
  }

  async ormInit(): Promise<void> {
    const orm = await this.initOrm.initialize();
    this.EntityManager = orm.em;
    this.templateEntity = this.EntityManager.getRepository(Template);
    this.fromAddress = <string>await this.configService.getValue('fromAddress');
    this.senderName = <string>await this.configService.getValue('senderName');
    this.bccAddress1 = <string>await this.configService.getValue('bccAddress1');
    this.bccAddress2 = <string>await this.configService.getValue('bccAddress2');
    this.bccAddress3 = <string>await this.configService.getValue('bccAddress3');
    this.bccAddress4 = <string>await this.configService.getValue('bccAddress4');
    await this.delay(1000);
  }

  async delay(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async getTemplateByName(templateName: string): Promise<Template> {
    return await this.templateEntity.findOne({
      name: templateName,
    });
  }

  private buildWatiParameters(parameters: Notification, template: Template): MessageRequestType {
    const templateParams = JSON.parse(template?.parameters);
    const buildParams = buildJsonSchema(templateParams);
    const mapper = new ObjectMapper(parameters, buildParams);
    const params = mapper.mapObjects();
    const contentMessage: MessageRequestType = {
      whatsAppNumber: parameters?.['whatsappNumber'] as string,
      body: '',
      buttons: [],
      type: MessageType.Text,
      templateName: template.slug,
    };

    if (template.type === SendType.Content) {
      if (template.contentType === ContentType.Button) {
        contentMessage['body'] = stringFormat(template.content, params);
        contentMessage['buttons'] = parameters?.buttons as string[];
        contentMessage['type'] = MessageType.Button;
      } else {
        contentMessage['body'] = stringFormat(template.content, params);
        contentMessage['type'] = MessageType.Text;
      }
    }
    if (template.type === SendType.Template) {
      contentMessage['body'] = params as TemplateParams;
      contentMessage['type'] = MessageType.Template;
    }

    return contentMessage;
  }

  private buildEmailParameters(parameters, template: Template): BodyMessageRequestType {
    const templateParams = JSON.parse(template?.parameters);
    const buildParams = buildJsonSchema(templateParams);
    const mapper = new ObjectMapper(parameters, buildParams);
    const params = mapper.mapObjects();
    const contentMessage = {
      fromAddress: this.fromAddress,
      senderName: this.senderName,
      bccEmailAddress1: this.bccAddress1,
      subject: template.subject,
      receiverName: parameters.name,
      toAddress: parameters.email,
      htmlBody: '',
      templateName: template.slug,
    };
    if ([Templates.accountActivation as string].includes(template.name)) {
      contentMessage['bccEmailAddress2'] = this.bccAddress2;
      contentMessage['bccEmailAddress4'] = this.bccAddress4;
    } else if ([Templates.oneTimePassword as string, Templates.resetPassword as string].includes(template.name)) {
      contentMessage['bccEmailAddress2'] = this.bccAddress2;
      contentMessage['bccEmailAddress3'] = this.bccAddress3;
      contentMessage['bccEmailAddress4'] = this.bccAddress4;
    }
    if (template.type === SendType.Content) {
      contentMessage['htmlBody'] = stringFormat(template.content, params);
    }
    if (parameters?.inlineImages) {
      contentMessage['inlineImages'] = parameters?.inlineImages;
    }
    return contentMessage;
  }

  async sendMessage(event: Notification): Promise<unknown> {
    let template: Template;
    try {
      template = await this.getTemplateByName(event.templateName);
    } catch (e) {
      throw new AppError('Template not found', 404);
    }

    if (event.action === Actions.Wati) {
      const contentMessage = this.buildWatiParameters(event, template);
      if (template.type === SendType.Content) return await this.watiClient.sendMessage(contentMessage);
      return await this.watiClient.sendMessageTemplate(contentMessage);
    } else if (event.action === Actions.Email) {
      const mailContent = this.buildEmailParameters(event, template);
      if (template.type === SendType.Content) return await this.mailClient.sendMail(mailContent);
    }

    await this.initOrm.closeConnection();
  }
}
