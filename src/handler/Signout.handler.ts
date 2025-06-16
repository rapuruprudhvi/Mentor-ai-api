import { Request, Response } from "express";
import { UserService } from "../service/user.service";
import { Injectable } from "../decorator/injectable.decorator";
import { RouteHandler } from "../types/handler";
import { ApiResponse } from "../types/api.responce";
import { UlidIdSchema } from "../validation/id.validation";

@Injectable()
export class SignoutHandler implements RouteHandler {
  constructor(private readonly userService: UserService) { }

  async handle(req: Request, res: Response<ApiResponse<null>>) {
    const user = req.user as { id: string };

    if (!user || !user.id) {
      return res.status(400).json({
        error: "User information is missing or invalid",
      });
    }
    const { error } = UlidIdSchema.safeParse(user.id);

    if (error) {
      return res.status(400).json({
        error: error.issues[0]?.message || 'Validation error',
      });
    }

    return res.status(200).json({
      data: null,
    });

  }
}