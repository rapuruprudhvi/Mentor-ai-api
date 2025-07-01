import { AppDataSource } from "../config/database";
import { Injectable } from "../decorator/injectable.decorator";
import { InterviewPrompt } from "../entity/InterviewPrompt";
import { randomUUID } from "crypto";
import { InterviewPromptDto } from "../dto/interview.prompt.dto";
import type { Repository } from "typeorm";
import { getAnswerFromClaude } from "./openai.service";

@Injectable()
export class InterviewPromptService {
  public repo: Repository<InterviewPrompt>;

  constructor() {
    this.repo = AppDataSource.getRepository(InterviewPrompt);
  }

  async create(userId: string, question: string, answer: string): Promise<InterviewPrompt> {
    const prompt = this.repo.create({
      id: randomUUID().replace(/-/g, "").slice(0, 26),
      question,
      answer,
      userId,
    });

    return this.repo.save(prompt);
  }


  async update(
  promptId: string,
  fullAnswer: string
): Promise<InterviewPrompt | null> {
  const prompt = await this.repo.findOne({ where: { id: promptId } });

  if (!prompt) return null;

  prompt.answer = fullAnswer;

  await this.repo.save(prompt);

  return prompt;
}


  async getPromptsByUserId(userId: string): Promise<InterviewPromptDto[]> {
    const prompts = await this.repo.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });

    return prompts.map((p) => ({
      id: p.id,
      question: p.question,
      answer: p.answer,
      createdAt: p.createdAt.toISOString(),
    }));
  }

  async findById(id: string): Promise<InterviewPrompt | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByQuestion(question: string): Promise<InterviewPrompt | null> {
    return this.repo.findOne({ where: { question } });
  }

  async findSimilarQuestions(
    question: string,
    limit = 5
  ): Promise<InterviewPrompt[]> {
    return this.repo
      .createQueryBuilder("prompt")
      .where("prompt.question ILIKE :query", { query: `%${question}%` })
      .orderBy("prompt.createdAt", "DESC")
      .take(limit)
      .getMany();
  }

  async getAllPrompts(limit = 100): Promise<InterviewPrompt[]> {
    return this.repo.find({
      order: { createdAt: "DESC" },
      take: limit,
    });
  }
}
