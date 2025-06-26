import { Request, Response } from "express";
import { Injectable } from "../decorator/injectable.decorator";
import { RouteHandler } from "../types/handler";
import { generateResetPasswordToken } from "../utils/jwt.utils";
import { sendPasswordResetEmail } from "../utils/mail.utils";
import { UserService } from "../service/user.service";
import { requestPasswordResetSchema } from "../dto/auth.validation";
import { ApiResponse } from "../types/api.responce";

@Injectable()
export class RequestResetHandler implements RouteHandler {
  constructor(private userService: UserService) { }

  async handle(req: Request, res: Response<ApiResponse<string>>) {
    try {
      const { error, data: body } = requestPasswordResetSchema.safeParse(req.body);

      if (error) {
        return res.status(400).json({
          error: 'Validation error',
        });
      }
      const email = body.email;
      const user = await this.userService.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const token = generateResetPasswordToken(email);
      await sendPasswordResetEmail(email, token);

      return res.status(200).json({ data: token, message: "Reset password link sent to email" });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || "Something Went Wrong" });
    }
  }
}