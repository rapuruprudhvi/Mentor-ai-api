import type { Request, Response } from "express";
import { Injectable } from "../decorator/injectable.decorator";
import { InterviewService } from "../service/interview.service";
import { InterviewPromptService } from "../service/interview.prompt.service";
import type { RouteHandler } from "../types/handler";
import type { User } from "../entity/user.entity";

@Injectable()
export class AskInterviewQuestionHandler implements RouteHandler {
  private interviewService: InterviewService;

  constructor() {
    const promptService = new InterviewPromptService();
    this.interviewService = new InterviewService(promptService);
  }

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { question } = req.body;
      const user = req.user as User;

      if (!user?.id) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (!question || typeof question !== "string") {
        res.status(400).json({ error: "Question is required" });
        return;
      }

      const result = await this.interviewService.processQuestion(sessionId, question);
      res.status(200).json({ question, answer: result.answer });
    } catch (error) {
      console.error("Error processing question:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }
}
