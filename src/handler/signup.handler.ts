import { Request, Response } from 'express';
import { generateToken } from '../utils/jwt.utils';
import { SignupResponse, signupSchema } from '../dto/auth.validation';
import { UserService } from '../service/user.service';
import { Injectable } from '../decorator/injectable.decorator';
import { RouteHandler } from '../types/handler';
import { ApiResponse } from '../types/api.responce';

@Injectable()
export class SignupHandler implements RouteHandler {
  constructor(private readonly userService: UserService) {}

  async handle(req: Request, res: Response<ApiResponse<SignupResponse>>) {
      const { error, data: body } = signupSchema.safeParse(req.body);

      if (error) {
        return res.status(400).json({
          error: error.issues[0]?.message || 'Validation error',
        });
      }

      const user = await this.userService.userSignUp(
        body.name,
        body.email,
        body.mobileNumber,
        body.password,
        body.emailVerified,
        body.mobileNumberVerified
      );

      const token = generateToken({ id: user.id, email: user.email });

      const response: SignupResponse = {
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          mobileNumber: user.mobileNumber,
          createdAt: user.createdAt?.toISOString(),
        },
      };

      return res.status(201).json({ data: response });
    } 
}