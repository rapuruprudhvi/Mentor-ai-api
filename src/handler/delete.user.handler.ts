import { Request, Response } from "express";
import { Injectable } from "../decorator/injectable.decorator";
import { RouteHandler } from "../types/handler";
import { UserService } from "../service/user.service";
import { ApiResponse } from "../types/api.responce";
import { z } from "zod";
import { UlidIdSchema } from "../dto/id.validation";

const userIdSchema = z.object({
  userId: UlidIdSchema,
});

@Injectable()
export class DeleteUserHandler implements RouteHandler {
  constructor(private readonly userService: UserService) {}

  async handle(req: Request, res: Response<ApiResponse<{ message: string }>>) {
    const { error, data: params } = userIdSchema.safeParse(req.params);
    if (error) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    await this.userService.deleteUser(params.userId);

    return res.status(200).json({
      data: { message: "User account and associated data deleted" },
    });
  }
}
