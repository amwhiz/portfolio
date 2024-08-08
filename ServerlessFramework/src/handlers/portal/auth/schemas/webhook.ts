export const webhookValidator = {
  type: 'object',
  properties: {
    objectId: { type: 'number' },
    objectType: { type: 'string' },
    objectTypeId: { type: 'string' },
    properties: {
      type: 'object',
      properties: {
        company_email: {
          type: 'object',
          properties: {
            value: { type: 'string' },
            versions: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
          required: ['value', 'version'],
        },
        name: {
          type: 'object',
          properties: {
            value: { type: 'string' },
            versions: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
          required: ['value', 'version'],
        },
        email: {
          type: 'object',
          properties: {
            value: { type: 'string' },
            versions: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
          required: ['value', 'version'],
        },
        hs_object_source: {
          type: 'object',
          properties: {
            value: { type: 'string' },
            versions: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
          required: ['value', 'version'],
        },
      },
      required: ['email', 'hs_object_source'],
    },
  },
  required: ['objectId', 'properties', 'objectType', 'objectTypeId'],
} as const;
