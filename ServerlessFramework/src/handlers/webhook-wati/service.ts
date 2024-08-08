import { IWorkflow } from '../../interfaces/workflows';
import { CRMWorkFlow, ParentWorkflow } from 'src/enums/workflows';
import { LoggerService, logger as Logger } from '@aw/logger';
import { DispatchWorkflows } from './workflows';
import { WorkflowBase } from './workflows/pushToQueue';
import ActivationExecute from './workflows/activation/activationExecutive';
import { ActivationExecutiveRequest } from './workflows/activation/interfaces/activation';
import { RechargeExecutiveRequest } from './workflows/recharge/interfaces/recharge';
import RechargeExecutive from './workflows/recharge/rechargeExecute';
import { lowerCase } from 'src/helpers/nameConvention';
import { SQSTypes } from 'src/constants/sqs';
import { Actions } from 'src/enums/actions';
import { Templates } from 'src/constants/templates';
import { safeStringify } from '@aw/libs';
import DynamoDBClient from '@aw/dynamodb';
import { WatiAttributes } from '@aw/wati/interfaces/wati';
import { WatiLogsEntity } from '@aw/wati/entity/wati';

export default class WebhookService extends WorkflowBase {
  private logger: typeof Logger;
  private notRequired: string = 'Not Required';
  private dynamoDBClient: DynamoDBClient;

  constructor() {
    super();
    this.logger = new LoggerService({ serviceName: WebhookService.name });
    this.dynamoDBClient = new DynamoDBClient();
  }

  async insertWatiLog(event: IWorkflow): Promise<void> {
    // Handle your DB log Here
    const createLog: WatiAttributes = {
      pk: event?.['whatsappNumber'] || 'logs',
      sk: `${new Date().getTime()}`,
      TemplateName: '',
      Method: 'POST' as string,
      RequestPayload: safeStringify(event || {}),
      RequestTime: 0,
      ResponseTime: 0,
      TotalTime: 0,
      Response: safeStringify({}),
      StatusCode: 200,
      type: 'Inbound',
      Url: '' as string,
    };

    await this.dynamoDBClient.put<WatiAttributes>(WatiLogsEntity, createLog);
  }

  // Workflow Webhook
  public async workflows(event: IWorkflow): Promise<void> {
    if (event?.['email']) event['email'] = lowerCase(event?.['email']);
    if (event?.['airtime'] === this.notRequired && event?.['validity'] === this.notRequired && event?.['plan'] === this.notRequired) {
      await this.pushToQueue(SQSTypes.notification, {
        action: Actions.Wati,
        templateName: Templates.noPlanSelected,
        whatsappNumber: event['whatsappNumber'],
      });
      return await this.insertWatiLog(event);
    }

    await this.pushToQueue(SQSTypes.workflow, event);
    await this.insertWatiLog(event);
  }

  public async dispatchWorkflows(event: IWorkflow): Promise<void> {
    switch (event.parentFlowName) {
      case ParentWorkflow.Buy:
        return await DispatchWorkflows.buy(event);
      case ParentWorkflow.Activation:
        return await DispatchWorkflows.Activation(event);
      case ParentWorkflow.Recharge:
        return await DispatchWorkflows.Recharge(event);
      case ParentWorkflow.Balance:
        return await DispatchWorkflows.Balance(event);
      case CRMWorkFlow.Location:
        return await DispatchWorkflows.Location(event);
      default:
        this.logger.error(`Unknown workflow: ${event.flowName}`);
        break;
    }
  }

  public async activationExecutive(event: ActivationExecutiveRequest): Promise<void> {
    const executiveActivation = new ActivationExecute();
    await executiveActivation.doActivation(event);
  }

  public async rechargeExecutive(event: RechargeExecutiveRequest): Promise<void> {
    const executiveRecharge = new RechargeExecutive();
    await executiveRecharge.doRecharge(event);
  }
}
