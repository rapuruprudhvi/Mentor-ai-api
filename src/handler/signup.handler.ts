import { Request, Response } from 'express';
import { generateToken } from '../utils/jwt.utils';
import { SignupResponse, signupSchema, UserResponse } from '../dto/auth.validation';
import { UserService } from '../service/user.service';
import { Injectable } from '../decorator/injectable.decorator';
import { RouteHandler } from '../types/handler';
import { ApiResponse } from '../types/api.responce';

@Injectable()
export class SignupHandler implements RouteHandler {
  constructor(private readonly userService: UserService) { }

  async handle(req: Request, res: Response<ApiResponse<{ token: string, user: UserResponse }>>) {
    try {
      const { error, data: body } = signupSchema.safeParse(req.body);

      if (error) {
        return res.status(400).json({
          error: 'Validation error',
        });
      }

      const user = await this.userService.userSignUp(
        body.name,
        body.email,
        body.mobileNumber ?? '',
        body.password,
      );

      // const registeredUser = await this.userService.getUserByEmail(body.email);

      // if (!registeredUser?.emailVerified) {
      //   return res.status(403).json({
      //     error: 'Please verify your email to complete registration',
      //   });
      // }
      

      const token = generateToken({ id: user.id, email: user.email });

      

      const response = {
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          mobileNumber: user.mobileNumber,
          createdAt: user.createdAt,
        },
      };

      return res.status(201).json({ data: response });


    } catch (error) {
      return res.status(400).json({
        error: (error instanceof Error ? error.message : 'Something Went Wrong'),
      });
    }
  }
}