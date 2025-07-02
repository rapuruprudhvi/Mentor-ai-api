import { Injectable } from "../decorator/injectable.decorator";
import { AppDataSource } from "../config/database";
import { User } from "../entity/user.entity";
import { Interview } from "../entity/interview.entity";
import { InterviewSession } from "../entity/interview.session.entity";
import type { InterviewPromptService } from "./interview.prompt.service";
import "reflect-metadata";
import { InterviewAnswer, StartInterviewResult } from "../dto/interview.dto";
import { InterviewPromptDto } from "../dto/interview.prompt.dto";
import { InterviewPrompt } from "../entity/InterviewPrompt";
import { customAlphabet } from "nanoid";
import { getAnswerFromOpenAI } from "./openai.service";

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 26);

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
    if (!user) throw new Error("User not found");

    let interview = await interviewRepository.findOne({ where: { title, userId } });

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

  async processQuestion(sessionId: string, question: string): Promise<InterviewAnswer> {
    const sessionRepository = AppDataSource.getRepository(InterviewSession);
    const promptRepository = AppDataSource.getRepository(InterviewPrompt);

    const session = await sessionRepository.findOne({ where: { id: sessionId } });
    if (!session || session.status !== "active") {
      throw new Error("Invalid or inactive session");
    }

    const userId = session.userId;
    const startTime = Date.now();

    try {
      // Check ONLY for existing question in this specific session
      let existingPrompt = await promptRepository.findOne({
        where: { 
          sessionId: sessionId,
          question: question 
        }
      });

      let aiAnswer: string;
      let promptId: string;

      if (existingPrompt) {
        // Use existing answer from the same session
        aiAnswer = existingPrompt.answer;
        promptId = existingPrompt.id;
        console.log('Using existing prompt from same session:', promptId);
      } else {
        // Always get fresh answer and create new record for this session
        aiAnswer = await getAnswerFromOpenAI(question);

        // Create new prompt record for this session
        const newPrompt = new InterviewPrompt();
        newPrompt.id = nanoid();
        newPrompt.userId = userId;
        newPrompt.sessionId = sessionId; // ✅ Ensure sessionId is properly set
        newPrompt.question = question;
        newPrompt.answer = aiAnswer;
        newPrompt.createdAt = new Date();

        console.log('Creating new prompt for sessionId:', sessionId);

        const savedPrompt = await promptRepository.save(newPrompt);
        promptId = savedPrompt.id;

        // Verify the save operation
        const verifyPrompt = await promptRepository.findOne({ where: { id: promptId } });
        console.log('Verified saved prompt sessionId:', verifyPrompt?.sessionId);
      }

      const processingTime = Date.now() - startTime;

      // Update session data
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

      sessionData.prompts.push(promptId);

      session.sessionData = sessionData;
      await sessionRepository.save(session);

      return { answer: aiAnswer };
    } catch (error) {
      console.error("Error processing question:", error);
      throw error;
    }
  }

  async endInterview(sessionId: string): Promise<void> {
    const sessionRepository = AppDataSource.getRepository(InterviewSession);
    const userRepository = AppDataSource.getRepository(User);

    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const session = await transactionalEntityManager.findOne(InterviewSession, {
        where: { id: sessionId },
      });

      if (!session) throw new Error("Session not found");

      const user = await transactionalEntityManager.findOne(User, {
        where: { id: session.userId },
      });

      if (!user) throw new Error("User not found");

      const endTime = new Date();
      const durationInSeconds = Math.floor((endTime.getTime() - session.startedAt.getTime()) / 1000);

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

    const interview = await interviewRepository.findOne({ where: { id: interviewId } });
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

    const totalInterviews = await interviewRepository.count({ where: { userId } });
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

  async getQuestionsBySession(sessionId: string): Promise<InterviewPromptDto[]> {
    const repository = AppDataSource.getRepository(InterviewPrompt);

    console.log('Fetching questions for sessionId:', sessionId); // Debug log

    const prompts = await repository.find({
      where: { sessionId },
      order: { createdAt: "ASC" },
    });

    console.log('Found prompts:', prompts.length); // Debug log

    return prompts.map((p) => ({
      id: p.id,
      question: p.question,
      answer: p.answer,
      createdAt: p.createdAt.toISOString(),
    }));
  }

  // ✅ Add this new method to get questions from session data as fallback
  async getQuestionsFromSessionData(sessionId: string): Promise<InterviewPromptDto[]> {
    const sessionRepository = AppDataSource.getRepository(InterviewSession);
    
    const session = await sessionRepository.findOne({ where: { id: sessionId } });
    if (!session || !session.sessionData) {
      return [];
    }

    const { questions, answers } = session.sessionData;
    
    // Combine questions and answers based on timestamp or index
    const combined: InterviewPromptDto[] = [];
    
    for (let i = 0; i < Math.min(questions.length, answers.length); i++) {
      combined.push({
        id: answers[i].promptId || `temp-${i}`,
        question: questions[i].question,
        answer: answers[i].answer,
        createdAt: new Date(questions[i].timestamp).toISOString(),
      });
    }

    return combined;
  }
}