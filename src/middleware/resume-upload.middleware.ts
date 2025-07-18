import type { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import { ulid } from "ulid";
import fs from "fs";
import { Injectable } from "../decorator/injectable.decorator";
import type { RouteHandler } from "../types/handler";

@Injectable()
export class ResumeUploadMiddleware implements RouteHandler {
  private upload: multer.Multer;

  constructor() {
    this.initializeUpload();
  }

  private initializeUpload(): void {
    const uploadDir = path.join(__dirname, "..", "..", "uploads", "resumes");
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log("📁 Created upload directory:", uploadDir);
    }

    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        console.log("📂 Setting destination:", uploadDir);
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueName = `${ulid()}-${Date.now()}${path.extname(file.originalname)}`;
        console.log("📝 Generated filename:", uniqueName);
        cb(null, uniqueName);
      },
    });

    this.upload = multer({
      storage,
      fileFilter: (req, file, cb) => {
        console.log("🔍 File filter - received file:", file.originalname, "mimetype:", file.mimetype);
        
        const allowed = [".pdf", ".doc", ".docx"];
        const ext = path.extname(file.originalname).toLowerCase();
        
        if (allowed.includes(ext)) {
          console.log("✅ File type allowed:", ext);
          cb(null, true);
        } else {
          console.log("❌ File type not allowed:", ext);
          cb(new Error(`Only PDF, DOC, and DOCX files are allowed. Received: ${ext}`));
        }
      },
      limits: { 
        fileSize: 5 * 1024 * 1024, // 5MB
        fieldSize: 2 * 1024 * 1024 // 2MB for form fields
      },
    });
  }

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    console.log("📦 Middleware reached: Handling file upload");
    console.log("📋 Request headers:", req.headers["content-type"]);
    console.log("📋 Request method:", req.method);
    console.log("👤 User from auth:", req.user ? (req.user as any).id : "No user");

    const uploadSingle = this.upload.single("resume");

    uploadSingle(req, res, (err: any) => {
      console.log("🎯 Upload callback triggered");
      
      if (err instanceof multer.MulterError) {
        console.error("❌ Multer error:", err.code, err.message);
        
        switch (err.code) {
          case 'LIMIT_FILE_SIZE':
            return res.status(400).json({ 
              error: "File too large. Maximum size is 5MB." 
            });
          case 'LIMIT_UNEXPECTED_FILE':
            return res.status(400).json({ 
              error: "Unexpected field name. Expected 'resume'." 
            });
          default:
            return res.status(400).json({ 
              error: `Upload error: ${err.message}` 
            });
        }
      } else if (err) {
        console.error("❌ Other upload error:", err.message);
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        console.error("❌ No file uploaded");
        console.log("📋 Request body:", req.body);
        console.log("📋 Request files:", req.files);
        return res.status(400).json({ 
          error: "No resume file uploaded. Make sure the field name is 'resume' and the form has enctype='multipart/form-data'." 
        });
      }

      console.log("✅ File uploaded successfully:");
      console.log("  - Original name:", req.file.originalname);
      console.log("  - Saved as:", req.file.filename);
      console.log("  - Path:", req.file.path);
      console.log("  - Size:", req.file.size, "bytes");
      console.log("  - Mimetype:", req.file.mimetype);

      console.log("📤 Proceeding to handler - req.file is populated");
      next(); // Move to handler
    });
  }
}