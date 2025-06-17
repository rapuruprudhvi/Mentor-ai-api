import { Request, Response } from "express";
import { CreateInterviewPromptZodSchema } from "../dto/interview.prompt.dto";
import { InterviewPromptService } from "../service/interview.prompt.service";
import { getAnswerFromOpenAI } from "../service/openai.service";
import { RouteHandler } from "../types/handler";
import { Injectable } from "../decorator/injectable.decorator";


@Injectable()
export class CreateInterviewPromptHandler implements RouteHandler {
  constructor(private readonly promptService: InterviewPromptService) { }
  async handle(req: Request, res: Response): Promise<void> {
    const { error, data } = CreateInterviewPromptZodSchema.safeParse(req.body);

    if (error) {
      res.status(400).json({ error: error.issues[0]?.message });
      return;
    }

    const { question } = data;
    const answer = await getAnswerFromOpenAI(question);
    const savedPrompt = await this.promptService.create(question, answer);

    res.status(201).json({
      data: {
        id: savedPrompt.id,
        question: savedPrompt.question,
        answer: savedPrompt.answer,
        createdAt: savedPrompt.createdAt,
      },
    });
  }
} 