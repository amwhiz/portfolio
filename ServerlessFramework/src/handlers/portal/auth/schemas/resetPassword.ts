export const resetPasswordValidator = {
  type: 'object',
  properties: {
    email: { type: 'string', pattern: '^\\S+@\\S+\\.\\S+$' },
    otp: { type: 'string' },
    newPassword: { type: 'string' },
  },
  required: ['email'],
} as const;
