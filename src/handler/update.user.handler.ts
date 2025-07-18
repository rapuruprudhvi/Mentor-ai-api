import { Request, Response } from "express";
import { Injectable } from "../decorator/injectable.decorator";
import { RouteHandler } from "../types/handler";
import { updateUserSchema, UserResponse } from "../dto/auth.validation";
import { UserService } from "../service/user.service";
import { ApiResponse } from "../types/api.responce";
import { UlidIdSchema } from "../dto/id.validation";
import z from "zod";
import { User } from "../entity/user.entity";

const userIdSchema = z.object({
  userId: UlidIdSchema,
})

@Injectable()
export class UpdateUserHandler implements RouteHandler {
  constructor(private readonly userService: UserService) {}

  async handle(req: Request, res: Response<ApiResponse<UserResponse>>) {
    try {
      const user = req.user as User

      if (!user) {
        return res.status(401).json({ error: "Unauthorized" })
      }

      const { error: paramsError, data: params } = userIdSchema.safeParse(req.params)

      if (paramsError) {
        return res.status(400).json({ error: paramsError.errors[0].message })
      }

     
      if (user.id !== params.userId) {
        return res.status(403).json({ error: "Forbidden: You can only update your own profile" })
      }

      const { error, data: updates } = updateUserSchema.safeParse(req.body)

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
          resume: updatedUser.resume,
          interviewCredits: updatedUser.interviewCredits,
          createdAt: updatedUser.createdAt,
        },
        message: "Profile updated successfully",
      })
    } catch (error) {
      console.error("Update user error:", error)
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Internal server error",
      })
    }
  }
}
