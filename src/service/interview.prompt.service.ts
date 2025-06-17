import { AppDataSource } from "../config/database";
import { Injectable } from "../decorator/injectable.decorator";
import { InterviewPrompt } from "../entity/InterviewPrompt";
import { randomUUID } from "crypto";

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

  async update(promptId: string, fullAnswer: string): Promise<InterviewPrompt | null> {
    const prompt = await this.repo.findOne({ where: { id: promptId } });

    if (!prompt) {
      return null;
    }

    prompt.answer = fullAnswer;
    return this.repo.save(prompt);
  }
}
