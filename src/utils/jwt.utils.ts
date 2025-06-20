import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface JwtPayload {
  id?: string;
  email: string;
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

export const generateResetPasswordToken = (email: string): string => {
  return jwt.sign({ email }, JWT_SECRET, { expiresIn: "10m" });
};
