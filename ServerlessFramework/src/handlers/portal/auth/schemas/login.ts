export const loginValidator = {
  type: 'object',
  properties: {
    email: { type: 'string', pattern: '^\\S+@\\S+\\.\\S+$' },
    password: { type: 'string' },
    rememberMe: { type: 'boolean' },
  },
  required: ['email', 'password'],
} as const;
