import { Request, Response } from 'express';
import { generateToken } from '../utils/jwt.utils';
import { SignupResponse, signupSchema, UserResponse } from '../dto/auth.validation';
import { UserService } from '../service/user.service';
import { Injectable } from '../decorator/injectable.decorator';
import { RouteHandler } from '../types/handler';
import { ApiResponse } from '../types/api.responce';
import { verifyRecaptcha } from '../utils/recaptcha.utilis';

@Injectable()
export class SignupHandler implements RouteHandler {
  constructor(private readonly userService: UserService) { }

  async handle(req: Request, res: Response<ApiResponse<{user: UserResponse }>>) {
    const { error, data: body } = signupSchema.safeParse(req.body);

    if (error) {
      return res.status(400).json({
        error: error.errors[0]?.message || 'Validation error',
      });
    }

    if (!body.recaptchaToken) {
      return res.status(400).json({ error: "reCAPTCHA token is required" });
    }

    const isHuman = await verifyRecaptcha(body.recaptchaToken);

    if (!isHuman) {
      return res.status(403).json({ error: "reCAPTCHA verification failed" });
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

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const response = {
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        createdAt: user.createdAt,
      },
    };

    return res.status(201).json({ data: response });
  }
}