import { SimPurchaseStatus } from 'src/entities/enums/simPurchase';
import { getValues } from 'src/helpers/getValues';

export const simPurchaseValidator = {
  type: 'object',
  properties: {
    quantity: { type: 'number' },
    status: { type: 'string', enum: getValues(SimPurchaseStatus) },
  },
  required: ['quantity', 'status'],
} as const;
