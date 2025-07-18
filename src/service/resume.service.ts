import { ulid } from "ulid";
import { Injectable } from "../decorator/injectable.decorator";
import type { DataSource } from "typeorm";
import { Resume } from "../entity/resume.entity";
import fs from "fs";

@Injectable()
export class ResumeService {
  constructor(private readonly dataSource: DataSource) {}

  async createResume(
    userId: string,
    originalName: string,
    fileName: string,
    filePath: string,
    fileSize: number,
    mimeType: string
  ) {
    const resumeRepo = this.dataSource.getRepository(Resume);

    await resumeRepo.update({ userId, isActive: true }, { isActive: false });

    const resume = resumeRepo.create({
      id: ulid(),
      userId,
      originalName,
      fileName,
      filePath,
      fileSize,
      mimeType,
      isActive: true,
    });

    const saved = await resumeRepo.save(resume);
    console.log("✅ Resume Saved:", saved);
    return saved;
  }

  async getUserActiveResume(userId: string) {
    const resumeRepo = this.dataSource.getRepository(Resume);
    return await resumeRepo.findOne({
      where: { userId, isActive: true },
      order: { createdAt: "DESC" },
    });
  }

  async deleteResume(resumeId: string, userId: string) {
    const resumeRepo = this.dataSource.getRepository(Resume);
    const resume = await resumeRepo.findOne({
      where: { id: resumeId, userId },
    });

    if (!resume) {
      throw new Error("Resume not found");
    }

    try {
      if (fs.existsSync(resume.filePath)) {
        fs.unlinkSync(resume.filePath);
      }
    } catch (error) {
      console.error("Error deleting file:", error);
    }

    await resumeRepo.delete({ id: resumeId });
    return { message: "Resume deleted successfully" };
  }

  async getUserResumes(userId: string) {
    const resumeRepo = this.dataSource.getRepository(Resume);
    return await resumeRepo.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });
  }
}
