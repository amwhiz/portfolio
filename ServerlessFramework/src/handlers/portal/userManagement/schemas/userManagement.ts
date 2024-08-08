import { getValues } from 'src/helpers/getValues';
import { Operation } from '../enums/operations';

export const createRoleBasedEntityValidator = {
  type: 'object',
  properties: {
    operation: {
      type: 'string',
      enum: getValues(Operation),
    },
    account: {
      type: 'object',
      properties: {
        agency: { type: 'string', pattern: '^\\S+@\\S+\\.\\S+$' },
        email: { type: 'string', pattern: '^\\S+@\\S+\\.\\S+$' },
        whatsapp: { type: 'string' },
      },
      required: ['email'],
    },
  },
  required: ['operation', 'account'],
} as const;
