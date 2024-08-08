/* eslint-disable @typescript-eslint/no-explicit-any */
import { middyfy } from '@libs/lambda';
import { SQSHandler } from 'aws-lambda';
import NotificationService from './service';

const notificationService = new NotificationService();

const notifications: SQSHandler = async (event): Promise<any> => {
  const data: any = event?.Records[0].body;
  await notificationService.ormInit();
  await notificationService.sendMessage(data);
  return { data: 'success' };
};

export const notification = middyfy(notifications);
