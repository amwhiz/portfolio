/* eslint-disable @typescript-eslint/no-explicit-any */
import { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { APIGatewayProxyEvent, SQSHandler } from 'aws-lambda';
import WebhookService from './service';
import { IWorkflow } from '../../interfaces/workflows';
import { workflowValidator } from '../webhook-wati/schemas/workflow';
import EventScheduler from './workflows/scheduler';

const webhookService = new WebhookService();

const workflowWebhooks: ValidatedEventAPIGatewayProxyEvent<typeof workflowValidator> = async (event): Promise<any> => {
  await webhookService.workflows(event.body);
  return { data: 'success' };
};

const workflowWorkers: SQSHandler = async (event): Promise<void> => {
  // const body: IWorkflow | any = event?.['body'];
  const body: IWorkflow | any = event.Records[0].body;
  return await webhookService.dispatchWorkflows(body);
};

const activationsWorker: SQSHandler = async (event): Promise<void> => {
  const body: IWorkflow | any = event.Records[0].body;
  // const body: IWorkflow | any = event?.['body'];
  return await webhookService.activationExecutive(body);
};

const rechargeWorker: SQSHandler = async (event): Promise<void> => {
  const body: IWorkflow | any = event.Records[0].body;
  return await webhookService.rechargeExecutive(body);
};

const scheduleWebhooks = async (event: APIGatewayProxyEvent): Promise<any> => {
  const scheduleEvent = event.body;
  const schedule = new EventScheduler();
  await schedule.sendToQueue(scheduleEvent);
  return { data: 'success' };
};

export const workflowWebhook = middyfy(workflowWebhooks, true);
export const workflowWorker = middyfy(workflowWorkers);
export const activationExecutiveWorker = middyfy(activationsWorker);
export const rechargeExecutiveWorker = middyfy(rechargeWorker);
export const scheduleWebhook = middyfy(scheduleWebhooks);
