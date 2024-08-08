/* eslint-disable @typescript-eslint/no-explicit-any */
import { middyfy } from '@libs/lambda';
import { SQSHandler } from 'aws-lambda';
import { Commission, CommissionBuilders } from './service';

const commissions: SQSHandler = async (event): Promise<any> => {
  // const data: any = event?.['body'];
  const data: any = event?.Records[0].body;
  const builder = new CommissionBuilders();
  await builder.buildPayload(new Commission(), data);
  return { data: 'success' };
};

export const commission = middyfy(commissions);
