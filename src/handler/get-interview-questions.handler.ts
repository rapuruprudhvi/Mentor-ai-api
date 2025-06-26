import { Request, Response } from "express";
import { Injectable } from "../decorator/injectable.decorator";
import { RouteHandler } from "../types/handler";
import { InterviewPromptService } from "../service/interview.prompt.service";
import { InterviewService } from "../service/interview.service";
import { AppDataSource } from "../config/database";
import { InterviewSession } from "../entity/interview.session.entity";

@Injectable()
export class GetInterviewQuestionsHandler implements RouteHandler {
  constructor(
    private readonly interviewPromptService: InterviewPromptService,
    private readonly interviewService = new InterviewService(interviewPromptService)
  ) { }

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const userId = (req.user as any)?.id;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (!sessionId) {
        res.status(400).json({ error: "Session ID is required" });
        return;
      }

      const sessionRepository = AppDataSource.getRepository(InterviewSession);
      const session = await sessionRepository.findOne({
        where: { id: sessionId, userId }
      });

      if (!session) {
        res.status(404).json({ error: "Session not found or access denied" });
        return;
      }

      const questions = await this.interviewService.getQuestionsBySession(sessionId);

      res.status(200).json({
        sessionId,
        questions,
        count: questions.length
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to retrieve interview questions"
      });
    }
  }
}
