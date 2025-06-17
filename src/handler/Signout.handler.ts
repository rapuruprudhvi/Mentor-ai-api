import { Request, Response } from "express";
import { Injectable } from "../decorator/injectable.decorator";
import { RouteHandler } from "../types/handler";
import { ApiResponse } from "../types/api.responce";
import { UserService } from "../service/user.service";

@Injectable()
export class SignoutHandler implements RouteHandler {
  constructor(private readonly userService: UserService) {}

  async handle(req: Request, res: Response<ApiResponse<null>>) {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).json({ error: "Authorization token not provided" });
    }

    const isBlacklisted = await this.userService.isTokenBlacklisted(token);

    if (isBlacklisted) {
      return res.status(401).json({ error: "Token already blacklisted" });
    }

    await this.userService.blacklistToken(token);

    return res.status(200).json({ data: null });
  }
}

