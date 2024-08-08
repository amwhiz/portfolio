import { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { PaymentSchema } from './schema/payment';
import PaymentService from './service';
import { SQSHandler } from 'aws-lambda';
import { LoggerService } from '@aw/logger';
import { PaymentType } from './constants/status';

const logger = new LoggerService({ serviceName: 'PaymentHandler' });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const paymentWebhooks: ValidatedEventAPIGatewayProxyEvent<typeof PaymentSchema> = async (event): Promise<any> => {
  const data = event?.body;

  if (data?.verificationCode) {
    logger.info('----VerificationCode webhook----');
    return { statusCode: 200, data: 'success' };
  }

  if (!Object.keys(PaymentType).includes(<string>data?.['status'] || <string>data?.['type'])) {
    logger.error('----UnHandle webhook----');
    return;
  }
  const payment = new PaymentService(data);
  await payment.webhookHandler();
  return { data: 'success' };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const paymentWorkers: SQSHandler = async (event): Promise<any> => {
  const data = event.Records[0].body;
  const payment = new PaymentService(data);
  await payment.paymentHandler();
  return { data: 'success' };
};

export const paymentWebhook = middyfy(paymentWebhooks);
export const paymentWorker = middyfy(paymentWorkers);
