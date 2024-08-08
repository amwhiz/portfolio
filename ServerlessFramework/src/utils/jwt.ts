/* eslint-disable no-undef */
import { AppError } from '@libs/api-error';
import * as jwt from 'jsonwebtoken';
import { env } from '@aw/env';
import { Accounts } from 'src/entities/account';

export function verifyToken(token: string): string | jwt.JwtPayload {
  // Try to validate the token and get data
  try {
    return jwt.verify(token, <string>env('jwtSecret'));
  } catch (error) {
    throw new AppError('Unauthorized', 401);
  }
}

export function generateToken(data: Partial<Accounts>, day: string): string {
  return jwt.sign(data, <string>env('jwtSecret'), {
    expiresIn: day,
  });
}
