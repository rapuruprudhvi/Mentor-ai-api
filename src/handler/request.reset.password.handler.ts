import { Request, Response } from "express";
import { Injectable } from "../decorator/injectable.decorator";
import { RouteHandler } from "../types/handler";
import { generateResetPasswordToken } from "../utils/jwt.utils";
import { sendPasswordResetEmail } from "../utils/mail.utils";
import { UserService } from "../service/user.service";
import { requestPasswordResetSchema } from "../dto/auth.validation";
import { ApiResponse } from "../types/api.responce";
import { verifyRecaptcha } from "../utils/recaptcha.utilis";

@Injectable()
export class RequestResetHandler implements RouteHandler {
  constructor(private userService: UserService) { }

  async handle(req: Request, res: Response<ApiResponse<string>>) {
    const { error, data: body } = requestPasswordResetSchema.safeParse(req.body);

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
    const email = body.email;
    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const token = generateResetPasswordToken(email);
    await sendPasswordResetEmail(email, token);

    return res.status(200).json({ data: token, message: "Reset password link sent to email" });
  }
}