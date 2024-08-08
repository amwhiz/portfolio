import { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { validatorSchema } from './schema/validator';
import ValidatorBase from './validator';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const validators: ValidatedEventAPIGatewayProxyEvent<typeof validatorSchema> = async (event): Promise<any> => {
  const validator = new ValidatorBase(event?.body);
  await validator.ormInit();
  return await validator.customerValidate();
};

export const validator = middyfy(validators, true);
