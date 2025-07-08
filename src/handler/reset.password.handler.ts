import { Request, Response } from "express";
import { Injectable } from "../decorator/injectable.decorator";
import { RouteHandler } from "../types/handler";
import { User } from "../entity/user.entity";
import { resetPasswordSchema, UserResponse } from "../dto/auth.validation";
import { ApiResponse } from "../types/api.responce";
import { UserService } from "../service/user.service";
import { verifyRecaptcha } from "../utils/recaptcha.utilis";

@Injectable()
export class ResetPasswordHandler implements RouteHandler {
  constructor(private readonly userService: UserService) { }

  async handle(
    req: Request,
    res: Response<ApiResponse<string>>) {
    const { error, data: body } = resetPasswordSchema.safeParse(req.body);

    if (error) {
      return res.status(400).json({
        error: error.errors[0]?.message || 'Validation error',
      });
    }
    const user = req.user as User;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!body.recaptchaToken) {
      return res.status(400).json({ error: "reCAPTCHA token is required" });
    }

    const isHuman = await verifyRecaptcha(body.recaptchaToken);

    if (!isHuman) {
      return res.status(403).json({ error: "reCAPTCHA verification failed" });
    }

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(400).json({ error: "Missing token" });
    }
    const isBlacklisted = await this.userService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      return res.status(403).json({ error: "Token has already been used" });
    }

    const updateUser = await this.userService.resetUserPassword(user, body.password);
    if (!updateUser) {
      return res.status(400).json({ error: "Failed to reset password" });
    }

    await this.userService.blacklistToken(token);

    return res.status(200).json({
      data: "Password reset successfully"
    });
  }
}