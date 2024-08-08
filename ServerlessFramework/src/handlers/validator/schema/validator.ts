export const validatorSchema = {
  type: 'object',
  properties: {
    date: {
      type: 'string',
      pattern: '^((0[1-9]|[12]\\d|3[01])/(0[1-9]|1[0-2])/[12]\\d{3})$',
    },
    serialNumber: {
      type: 'string',
      pattern: '^[0-9]{18}$',
    },
    email: {
      type: 'string',
      pattern: '^\\S+@\\S+\\.\\S+$',
    },
  },
} as const;
