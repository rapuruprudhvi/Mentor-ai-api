import { Request, Response } from "express";
import { Injectable } from "../decorator/injectable.decorator";
import { RouteHandler } from "../types/handler";
import { InterviewPromptService } from "../service/interview.prompt.service";

@Injectable()
export class GetAllPromptsHandler implements RouteHandler {
  constructor(private readonly interviewService: InterviewPromptService) { }


  async handle(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as any)?.id;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const prompts = await this.interviewService.getPromptsByUserId(userId);
      res.status(200).json({ data: prompts });
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve interview prompts" });
    }
  }

}
