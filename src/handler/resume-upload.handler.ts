import type { Request, Response } from "express";
import { Injectable } from "../decorator/injectable.decorator";
import type { ResumeService } from "../service/resume.service";
import type { UserService } from "../service/user.service";
import type { RouteHandler } from "../types/handler";
import type { ApiResponse } from "../types/api.responce";
import type { User } from "../entity/user.entity";

interface ResumeResponse {
  id: string;
  originalName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: Date;
}

@Injectable()
export class ResumeUploadHandler implements RouteHandler {
  constructor(
    private readonly resumeService: ResumeService,
    private readonly userService: UserService,
  ) {}

  async handle(req: Request, res: Response<ApiResponse<ResumeResponse>>) {
    try {
      console.log("🎯 === Resume Upload Handler Started ===");
      
      const user = req.user as User;
      console.log("👤 User check:", user ? `Found user: ${user.id}` : "No user found");

      if (!user) {
        console.log("❌ No user found - returning 401");
        return res.status(401).json({ error: "Unauthorized" });
      }

      console.log("📁 File check:", req.file ? "File found" : "No file found");
      console.log("📋 Full req.file object:", req.file);

      if (!req.file) {
        console.log("❌ No file found in request");
        console.log("📋 Request body:", req.body);
        console.log("📋 Request files:", req.files);
        return res.status(400).json({ error: "No resume file uploaded" });
      }

      const fileInfo = {
        originalname: req.file.originalname,
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype,
      };
      
      console.log("✅ File details:", fileInfo);

      console.log("💾 Step 1: Creating resume record...");
      try {
        const resume = await this.resumeService.createResume(
          user.id,
          req.file.originalname,
          req.file.filename,
          req.file.path,
          req.file.size,
          req.file.mimetype,
        );
        console.log("✅ Resume record created successfully:", resume.id);

        console.log("💾 Step 2: Updating user resume path...");
        await this.userService.updateUserResume(user.id, req.file.path);
        console.log("✅ User resume path updated successfully");

        const response = {
          data: {
            id: resume.id,
            originalName: resume.originalName,
            fileName: resume.fileName,
            fileSize: resume.fileSize,
            mimeType: resume.mimeType,
            createdAt: resume.createdAt,
          },
          message: "Resume uploaded successfully",
        };

        console.log("📤 Sending success response");
        return res.status(200).json(response);

      } catch (dbError) {
        console.error("❌ Database operation failed:", dbError);
        throw dbError; // Re-throw to be caught by outer catch
      }

    } catch (error) {
      console.error("❌ Resume upload handler error:", error);
      
      if (error instanceof Error) {
        console.error("❌ Error details:", {
          name: error.name,
          message: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        });
      }

      return res.status(500).json({
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }
}