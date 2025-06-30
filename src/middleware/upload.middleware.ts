import { Injectable } from "../decorator/injectable.decorator";
import { RouteHandler } from "../types/handler";
import { Request, Response, NextFunction } from "express";
import multer, { FileFilterCallback } from "multer";
import path from "path";

@Injectable()
export class UploadProfilePhotoMiddleware implements RouteHandler {
  private readonly upload = multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, "uploads/profile/"),
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, uniqueName);
      },
    }),
    fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Only JPG, JPEG, and PNG files are allowed"));
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }).single("profilePhoto");

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    this.upload(req, res, (err: any) => {
      if (err) {
        const message =
          err instanceof multer.MulterError
            ? `Multer error: ${err.message}`
            : err.message || "Unknown upload error";
        return res.status(400).json({ message: "Profile photo upload failed", error: message });
      }
      next();
    });
  }
}
