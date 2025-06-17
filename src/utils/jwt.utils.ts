import jwt from 'jsonwebtoken';

export interface JwtPayload {
    id: string;
    email: string;
  }

export const generateToken = (payload: JwtPayload): string => {
  const secret = process.env.JWT_SECRET!;
  return jwt.sign(payload, secret, { expiresIn: '1d' });
};
