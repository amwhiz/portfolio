/* eslint-disable @typescript-eslint/no-explicit-any */
import { middyfy } from '@libs/lambda';
import { SQSHandler } from 'aws-lambda';
import CRMService from './service';

const notificationService = new CRMService();

const crmService: SQSHandler = async (event): Promise<any> => {
  // const data: any = event?.['body'];
  const data: any = event?.Records[0].body;
  await notificationService.dispatchWorkflows(data);
  return { data: 'success' };
};

export const crm = middyfy(crmService);
