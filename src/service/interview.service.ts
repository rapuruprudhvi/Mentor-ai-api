import { Injectable } from "../decorator/injectable.decorator";
import { AppDataSource } from "../config/database";
import { User } from "../entity/user.entity";
import { Interview } from "../entity/interview.entity";
import { InterviewSession } from "../entity/interview.session.entity";
import { getAnswerFromOpenAI } from "./openai.service";
import type { InterviewPromptService } from "./interview.prompt.service";
import "reflect-metadata";
import { InterviewAnswer, StartInterviewResult } from "../dto/interview.dto";

@Injectable()
export class InterviewService {
  constructor(
    private readonly interviewPromptService: InterviewPromptService
  ) {}

  async startInterview(
    userId: string,
    title: string
  ): Promise<StartInterviewResult> {
    const userRepository = AppDataSource.getRepository(User);
    const interviewRepository = AppDataSource.getRepository(Interview);
    const sessionRepository = AppDataSource.getRepository(InterviewSession);

    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }

    if (user.interviewCredits <= 0) {
      throw new Error(
        "Insufficient credits. Please purchase more credits to continue."
      );
    }

    let interview = await interviewRepository.findOne({
      where: { title, userId },
    });

    if (!interview) {
      interview = new Interview();
      interview.title = title;
      interview.userId = userId;
      await interviewRepository.save(interview);
    }

    const session = new InterviewSession();
    session.userId = userId;
    session.interviewId = interview.id;
    session.status = "active";
    session.startedAt = new Date();
    session.sessionData = { questions: [], answers: [], prompts: [] };
    await sessionRepository.save(session);

    const maxDurationMinutes = user.interviewCredits === 1 ? 5 : 120;

    return {
      sessionId: session.id,
      remainingCredits: user.interviewCredits,
      maxDurationMinutes,
    };
  }

  async processQuestion(
    sessionId: string,
    question: string
  ): Promise<InterviewAnswer> {
    const sessionRepository = AppDataSource.getRepository(InterviewSession);
    const session = await sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session || session.status !== "active") {
      throw new Error("Invalid or inactive session");
    }

    const startTime = Date.now();

    try {
      const existingPrompt = await this.interviewPromptService.findByQuestion(
        question
      );

      let aiAnswer: string;
      let promptId: string;

      if (existingPrompt) {
        aiAnswer = existingPrompt.answer;
        promptId = existingPrompt.id;
      } else {
        aiAnswer = await getAnswerFromOpenAI(question);
        const newPrompt = await this.interviewPromptService.create(
          question,
          aiAnswer
        );
        promptId = newPrompt.id;
      }

      const processingTime = Date.now() - startTime;

      const sessionData = session.sessionData || {
        questions: [],
        answers: [],
        prompts: [],
      };
      sessionData.questions.push({
        question,
        timestamp: Date.now(),
      });
      sessionData.answers.push({
        answer: aiAnswer,
        timestamp: Date.now(),
        processingTime,
        promptId,
      });
      sessionData.prompts = sessionData.prompts || [];
      sessionData.prompts.push(promptId);

      session.sessionData = sessionData;
      await sessionRepository.save(session);

      return {
        answer: aiAnswer,
        timestamp: Date.now(),
        processingTime,
        promptId,
      };
    } catch (error) {
      console.error("Error processing question:", error);
      throw new Error("Failed to generate answer");
    }
  }

  async endInterview(sessionId: string): Promise<void> {
    const sessionRepository = AppDataSource.getRepository(InterviewSession);
    const userRepository = AppDataSource.getRepository(User);

    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const session = await transactionalEntityManager.findOne(
        InterviewSession,
        {
          where: { id: sessionId },
        }
      );

      if (!session) {
        throw new Error("Session not found");
      }

      const user = await transactionalEntityManager.findOne(User, {
        where: { id: session.userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const endTime = new Date();
      const durationInSeconds = Math.floor(
        (endTime.getTime() - session.startedAt.getTime()) / 1000
      );

      session.status = "completed";
      session.endedAt = endTime;
      session.durationInSeconds = durationInSeconds;
      session.creditsUsed = 1;

      user.interviewCredits = Math.max(0, user.interviewCredits - 1);

      await transactionalEntityManager.save(session);
      await transactionalEntityManager.save(user);
    });
  }

  async getSessionStatus(sessionId: string): Promise<InterviewSession | null> {
    const sessionRepository = AppDataSource.getRepository(InterviewSession);
    return await sessionRepository.findOne({ where: { id: sessionId } });
  }

  async getUserInterviewHistory(userId: string): Promise<InterviewSession[]> {
    const sessionRepository = AppDataSource.getRepository(InterviewSession);
    return await sessionRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });
  }

  async getInterviewWithSessions(interviewId: string): Promise<{
    interview: Interview | null;
    sessions: InterviewSession[];
  }> {
    const interviewRepository = AppDataSource.getRepository(Interview);
    const sessionRepository = AppDataSource.getRepository(InterviewSession);

    const interview = await interviewRepository.findOne({
      where: { id: interviewId },
    });
    const sessions = await sessionRepository.find({
      where: { interviewId },
      order: { createdAt: "DESC" },
    });

    return { interview, sessions };
  }

  async getUserInterviews(userId: string): Promise<Interview[]> {
    const interviewRepository = AppDataSource.getRepository(Interview);
    return await interviewRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });
  }

  async getInterviewStats(userId: string): Promise<{
    totalInterviews: number;
    totalSessions: number;
    totalDuration: number;
    averageSessionDuration: number;
    completedSessions: number;
    activeSessions: number;
  }> {
    const interviewRepository = AppDataSource.getRepository(Interview);
    const sessionRepository = AppDataSource.getRepository(InterviewSession);

    const totalInterviews = await interviewRepository.count({
      where: { userId },
    });
    const allSessions = await sessionRepository.find({ where: { userId } });

    const totalSessions = allSessions.length;
    const totalDuration = allSessions.reduce(
      (sum, session) => sum + session.durationInSeconds,
      0
    );
    const completedSessions = allSessions.filter(
      (session) => session.status === "completed"
    ).length;
    const activeSessions = allSessions.filter(
      (session) => session.status === "active"
    ).length;
    const averageSessionDuration =
      totalSessions > 0 ? totalDuration / totalSessions : 0;

    return {
      totalInterviews,
      totalSessions,
      totalDuration,
      averageSessionDuration,
      completedSessions,
      activeSessions,
    };
  }
}
