import { Request, Response } from "express";
import { Injectable } from "../decorator/injectable.decorator";
import { UserService } from "../service/user.service";
import { RouteHandler } from "../types/handler";
import { ApiResponse } from "../types/api.responce";
import { UserResponse } from "../dto/auth.validation";
import { User } from "../entity/user.entity";

@Injectable()
export class GetUserHandler implements RouteHandler {
  constructor(private readonly userService: UserService) {}

  async handle(req: Request, res: Response<ApiResponse<UserResponse>>) {
    const user = req.user as User;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const dbUser = await this.userService.getUser(user.id);
    if (!dbUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const userResponse: UserResponse = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      mobileNumber: dbUser.mobileNumber,
      interviewCredits:dbUser.interviewCredits,
      createdAt: dbUser.createdAt,
    };

    return res.status(200).json({ data: userResponse });
  }
}
