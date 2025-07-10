import { Request, Response } from "express";
import { Injectable } from "../decorator/injectable.decorator";
import { UserService } from "../service/user.service";
import { ApiResponse } from "../types/api.responce";
import { RouteHandler } from "../types/handler";
import { generateToken } from "../utils/jwt.utils";
import { signinSchema, UserResponse } from "../dto/auth.validation";
import { verifyRecaptcha } from "../utils/recaptcha.utilis";

@Injectable()
export class SigninHandler implements RouteHandler {
  constructor(private readonly userService: UserService) { }
  async handle(
    req: Request,
    res: Response<ApiResponse<{ user: UserResponse }>>,) {
    const { error, data: body } = signinSchema.safeParse(req.body);
    if (error) {
      res.status(400).json({
        error:error.errors[0]?.message|| 'Validation error',
      });
      return;
    }

    if (!body.recaptchaToken) {
      return res.status(400).json({ error: "reCAPTCHA token is required" });
    }

    const isHuman = await verifyRecaptcha(body.recaptchaToken);

    if (!isHuman) {
      return res.status(403).json({ error: "reCAPTCHA verification failed" });
    }

    const user = await this.userService.userSignIn(body.identifier, body.password);

    if (!user) {
      res.status(400).json({
        error: "Invalid email or password",
      });
      return;
    }
    // const registeredUser = await this.userService.getUserByEmail(body.identifier);

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
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const response = {
      message: 'User signed in successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber ?? '',
        createdAt: user.createdAt,
      },
    };

    return res.status(200).json({ data: response });
  }
}
