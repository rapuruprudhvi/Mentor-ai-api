import { Request, Response, NextFunction } from 'express';
import { signinSchema, SigninInput } from '../validation/auth.validation';
import { findUserByIdentifier, validatePassword } from '../service/user.service';
import { generateToken } from '../utils/jwt.utils';

export const signinHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed: SigninInput = signinSchema.parse(req.body);
    const { identifier, password } = parsed;

    const user = await findUserByIdentifier(identifier);
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const isValid = await validatePassword(password, user.password);
    if (!isValid) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const token = generateToken({ id: user.id, email: user.email });

    res.status(200).json({
      message: 'Signin successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
};
