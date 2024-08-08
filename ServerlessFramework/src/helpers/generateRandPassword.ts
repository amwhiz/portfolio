export const generateRandPassword = (): string => Math.random().toString(36).slice(-8);
