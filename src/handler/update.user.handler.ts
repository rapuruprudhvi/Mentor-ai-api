import { Request, Response } from "express";
import { Injectable } from "../decorator/injectable.decorator";
import { RouteHandler } from "../types/handler";
import { updateUserSchema, UserResponse } from "../dto/auth.validation";
import { UserService } from "../service/user.service";
import { ApiResponse } from "../types/api.responce";
import { UlidIdSchema } from "../dto/id.validation";
import z from "zod";

const userIdSchema = z.object({
  userId: UlidIdSchema,
});
@Injectable()
export class UpdateUserHandler implements RouteHandler {
  constructor(private readonly userService: UserService) { }

  async handle(req: Request, res: Response<ApiResponse<UserResponse>>) {

    const { error: paramsError, data: params } = userIdSchema.safeParse(
      req.params,
    );

    if (paramsError) {
      return res.status(400).json({ error: paramsError.errors[0].message });
    }

    const { error, data: updates } = updateUserSchema.safeParse(req.body);

    if (error) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    const updatedUser = await this.userService.updateUser(params.userId, updates);

    return res.status(200).json({
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        mobileNumber: updatedUser.mobileNumber,
        role: updatedUser.role,
        profilePicture: updatedUser.profilePicture
      },
      message: "profile updated successfully"
    });
  }
}
