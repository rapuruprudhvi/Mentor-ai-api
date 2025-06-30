import type { Request, Response, NextFunction } from "express"
import multer from "multer"
import path from "path"
import { ulid } from "ulid"
import { Injectable } from "../decorator/injectable.decorator"
import type { RouteHandler } from "../types/handler"
import type { Express } from "express" 

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/resumes/") 
  },
  filename: (req, file, cb) => {
    const uniqueName = `${ulid()}-${Date.now()}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  },
})

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  
  const allowedTypes = [".pdf", ".doc", ".docx"]
  const fileExtension = path.extname(file.originalname).toLowerCase()

  if (allowedTypes.includes(fileExtension)) {
    cb(null, true)
  } else {
    cb(new Error("Only PDF, DOC, and DOCX files are allowed for resume upload"))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, 
  },
})

@Injectable()
export class ResumeUploadMiddleware implements RouteHandler {
  async handle(req: Request, res: Response, next: NextFunction) {
    const uploadSingle = upload.single("resume")

    uploadSingle(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ error: "Resume file size should not exceed 5MB" })
          }
        }
        return res.status(400).json({ error: err.message })
      }

      // Add resume path to request body if file was uploaded
      if (req.file) {
          console.log("Resume uploaded:", req.file.path);

        req.body.resume = req.file.path
      }

      next()
    })
  }
}
