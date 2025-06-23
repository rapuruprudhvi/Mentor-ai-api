import type { Request, Response } from "express";
import { Injectable } from "../decorator/injectable.decorator";
import { InterviewService } from "../service/interview.service";
import { InterviewPromptService } from "../service/interview.prompt.service";
import type { RouteHandler } from "../types/handler";
import type { User } from "../entity/user.entity";

@Injectable()
export class StartInterviewHandler implements RouteHandler {
  private interviewService: InterviewService;
  constructor() {
    const interviewPromptService = new InterviewPromptService();
    this.interviewService = new InterviewService(interviewPromptService);
  }

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const { title } = req.body;
      const user = req.user as User;

      if (!user?.id) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (!title) {
        res.status(400).json({ error: "Interview title is required" });
        return;
      }

      const result = await this.interviewService.startInterview(user.id, title);
      res.status(200).json(result);
    } catch (error) {
      console.error("Start interview error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }
}
