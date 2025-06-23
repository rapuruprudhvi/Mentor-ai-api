import { Request, Response } from "express";
import { Injectable } from "../decorator/injectable.decorator";
import { RouteHandler } from "../types/handler";
import { User } from "../entity/user.entity";
import { resetPasswordSchema, UserResponse } from "../dto/auth.validation";
import { ApiResponse } from "../types/api.responce";
import { UserService } from "../service/user.service";

@Injectable()
export class ResetPasswordHandler implements RouteHandler {
  constructor(private readonly userService: UserService) { }

  async handle(
    req: Request,
    res: Response<ApiResponse<UserResponse>>) {
    try {
      const { error, data: body } = resetPasswordSchema.safeParse(req.body);

      if (error) {
        return res.status(400).json({
          error: 'Validation error',
        });
      }
      const user = req.user as User;

      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
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

      const response: UserResponse = {
        id: updateUser.user.id,
        name: updateUser.user.name,
        email: updateUser.user.email,
        mobileNumber: updateUser.user.mobileNumber ?? '',
        createdAt: updateUser.user.createdAt,
      };

      return res.status(200).json({
        message: "Password reset successfully",
        data: response
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Internal server error" });
    }
  }
}