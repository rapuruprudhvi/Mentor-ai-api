import type { Request, Response } from "express";
import { Injectable } from "../decorator/injectable.decorator";
import { InterviewService } from "../service/interview.service";
import { InterviewPromptService } from "../service/interview.prompt.service";
import type { RouteHandler } from "../types/handler";
import type { User } from "../entity/user.entity";

@Injectable()
export class EndInterviewHandler implements RouteHandler {
  private interviewService: InterviewService;

  constructor() {
    const interviewPromptService = new InterviewPromptService();
    this.interviewService = new InterviewService(interviewPromptService);
  }

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const user = req.user as User;

      if (!user?.id) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      await this.interviewService.endInterview(sessionId);
      res.status(200).json({ message: "Interview ended successfully" });
    } catch (error) {
      console.error("Failed to end interview:", error);
      res.status(500).json({
        error:
          error instanceof Error ? error.message : "Failed to end interview",
      });
    }
  }
}
