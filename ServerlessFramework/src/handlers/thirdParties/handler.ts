/* eslint-disable @typescript-eslint/no-explicit-any */
import { middyfy } from '@libs/lambda';
import { APIGatewayProxyEvent, SQSHandler } from 'aws-lambda';
import { ThirdPartyService } from './service';
import { IParcelNinjaWebhook } from './interfaces/parcelninja';
import { ILocationUpdate } from './interfaces/locationUpdate';

const thirdPartyWebhooks = async (event: APIGatewayProxyEvent): Promise<any> => {
  const thirdParty = new ThirdPartyService(event?.body as unknown as IParcelNinjaWebhook | ILocationUpdate);
  await thirdParty.webhook();
  return { data: 'success' };
};

const thirdPartyWorkers: SQSHandler = async (event): Promise<void> => {
  // const body: IParcelNinjaWebhook | ILocationUpdate | any = event?.['body'];
  const body: IParcelNinjaWebhook | ILocationUpdate | any = event.Records[0].body;
  const thirdParty = new ThirdPartyService(body);
  await thirdParty.disPatchService();
};

export const thirdPartyWebhook = middyfy(thirdPartyWebhooks);
export const thirdPartyWorker = middyfy(thirdPartyWorkers);
