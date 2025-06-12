import { NextFunction, Request, Response } from 'express';
import { generateToken } from '../utils/jwt.utils';
import { SignupInput, signupSchema } from '../validation/auth.validation';
import { createUser } from '../service/user.service';
import { SignupResponse } from '../types/auth.types';

export const signupHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed: SignupInput = signupSchema.parse(req.body);
    const { name, email, password } = parsed;

    const user = await createUser(name, email, password);
    const token = generateToken({ id: user.id, email: user.email });


    const response: SignupResponse = {
      message: 'Account created successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
      },
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}

