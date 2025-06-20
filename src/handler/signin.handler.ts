import { Request, Response } from "express";
import { Injectable } from "../decorator/injectable.decorator";
import { UserService } from "../service/user.service";
import { ApiResponse } from "../types/api.responce";
import { RouteHandler } from "../types/handler";
import { generateToken } from "../utils/jwt.utils";
import { signinSchema, UserResponse } from "../dto/auth.validation";

@Injectable()
export class SigninHandler implements RouteHandler {
  constructor(private readonly userService: UserService) { }
  async handle(
    req: Request,
    res: Response<ApiResponse<{ token: string, user: UserResponse }>>,) {
    const { error, data: body } = signinSchema.safeParse(req.body);
    try {
      if (error) {
        res.status(400).json({
          error: 'Validation error',
        });
        return;
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

      res.status(200).json({
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            mobileNumber: user.mobileNumber ?? '',
            createdAt: user.createdAt,
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        error: (error instanceof Error ? error.message : 'Internal server error'),
      });
    }
  }
}
