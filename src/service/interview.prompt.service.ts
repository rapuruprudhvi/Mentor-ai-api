import { AppDataSource } from "../config/database";
import { Injectable } from "../decorator/injectable.decorator";
import { InterviewPrompt } from "../entity/InterviewPrompt";
import { randomUUID } from "crypto";
import { InterviewPromptDto } from "../dto/interview.prompt.dto";

@Injectable()
export class InterviewPromptService {
  private repo = AppDataSource.getRepository(InterviewPrompt);

  async create(question: string, answer: string): Promise<InterviewPrompt> {
    const prompt = this.repo.create({
      id: randomUUID().replace(/-/g, "").slice(0, 26),
      question,
      answer,
    });

    return this.repo.save(prompt);
  }

  async getAllPrompts(): Promise<InterviewPromptDto[]> {
    const prompts = await this.repo.find({
      order: {
        createdAt: "DESC",
      },
    });

    return prompts.map((p) => ({
      id: p.id,
      question: p.question,
      answer: p.answer,
      createdAt: p.createdAt.toISOString(),
    }));
  }
}
