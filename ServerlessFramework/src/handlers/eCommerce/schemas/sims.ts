export const simValidator = {
  type: 'object',
  properties: {
    email: { type: 'string', pattern: '^\\S+@\\S+\\.\\S+$' },
    type: { type: 'string' },
    simId: { type: 'string' },
    simName: { type: 'string' },
    mobileNo: { type: 'string' },
    offset: { type: 'string' },
    rewardData: { type: 'string' },
  },
} as const;
