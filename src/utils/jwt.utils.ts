import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/auth.types';

export const generateToken = (payload: JwtPayload): string => {
  const secret = process.env.JWT_SECRET!;
  return jwt.sign(payload, secret, { expiresIn: '1d' });
};
