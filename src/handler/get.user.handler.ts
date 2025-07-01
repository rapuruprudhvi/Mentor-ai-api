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
      interviewCredits: dbUser.interviewCredits,
      resume: dbUser.resume,
      role: dbUser.role,
      createdAt: dbUser.createdAt,
    };

    return res.status(200).json({ data: userResponse });
  }
}

// import type { Request, Response } from "express";
// import { Injectable } from "../decorator/injectable.decorator";
// import type { UserService } from "../service/user.service";
// import type { ResumeService } from "../service/resume.service";
// import type { RouteHandler } from "../types/handler";
// import type { ApiResponse } from "../types/api.responce";
// import type { UserResponse } from "../dto/auth.validation";
// import type { User } from "../entity/user.entity";

// @Injectable()
// export class GetUserHandler implements RouteHandler {
//   constructor(
//     private readonly userService: UserService,
//     private readonly resumeService: ResumeService
//   ) {}

//   async handle(req: Request, res: Response<ApiResponse<UserResponse>>) {
//     try {
//       const user = req.user as User;

//       if (!user) {
//         return res.status(401).json({ error: "Unauthorized" });
//       }

//       const dbUser = await this.userService.getUser(user.id);

//       if (!dbUser) {
//         return res.status(404).json({ error: "User not found" });
//       }

//       // Get active resume information
//       const activeResume = await this.resumeService.getUserActiveResume(
//         user.id
//       );

//       const userResponse: UserResponse = {
//         id: dbUser.id,
//         name: dbUser.name,
//         email: dbUser.email,
//         mobileNumber: dbUser.mobileNumber,
//         interviewCredits: dbUser.interviewCredits,
//         resume: dbUser.resume,
//         resumeInfo: activeResume
//           ? {
//               id: activeResume.id,
//               originalName: activeResume.originalName,
//               fileName: activeResume.fileName,
//               fileSize: activeResume.fileSize,
//               mimeType: activeResume.mimeType,
//               createdAt: activeResume.createdAt,
//             }
//           : null,
//         role: dbUser.role,

//         createdAt: dbUser.createdAt,
//       };

//       return res.status(200).json({ data: userResponse });
//     } catch (error) {
//       console.error("Get user error:", error);
//       return res.status(500).json({
//         error: error instanceof Error ? error.message : "Internal server error",
//       });
//     }
//   }
// }
