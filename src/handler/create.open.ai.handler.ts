import { Request, Response } from "express";
import { CreateInterviewPromptZodSchema } from "../dto/interview.prompt.dto";
import { InterviewPromptService } from "../service/interview.prompt.service";
import { RouteHandler } from "../types/handler";
import { Injectable } from "../decorator/injectable.decorator";
import { getAnswerFromClaude } from "../service/openai.service";

@Injectable()
export class CreateInterviewPromptHandler implements RouteHandler {
  constructor(private readonly promptService: InterviewPromptService) {}

  async handle(req: Request, res: Response): Promise<void> {
    const { error, data } = CreateInterviewPromptZodSchema.safeParse(req.body);

    if (error) {
      res.status(400).json({ error: error.issues[0]?.message });
      return;
    }

    const { question } = data;
    const userId = (req.user as any)?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    try {
      const answer = await getAnswerFromClaude(question);

      if (
        !answer ||
        answer.toLowerCase().includes("failed to get answer from") ||
        answer.toLowerCase().includes("no response from")
      ) {
        res.status(502).json({ error: "Claude API failed to respond properly." });
        return;
      }

      const savedPrompt = await this.promptService.create(userId, question, answer);

      res.status(201).json({
        data: {
          id: savedPrompt.id,
          question: savedPrompt.question,
          answer: savedPrompt.answer,
          createdAt: savedPrompt.createdAt,
        },
      });
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}
