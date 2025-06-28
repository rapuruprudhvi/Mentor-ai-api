// dto/interview.dto.ts
import { z } from "zod";

export const interviewAnswerSchema = z.object({
  answer: z.string()
});

export type InterviewAnswer = z.infer<typeof interviewAnswerSchema>;

export const interviewQuestionSchema = z.object({
  question: z.string()
});

export type InterviewQuestion = z.infer<typeof interviewQuestionSchema>;


export const startInterviewResultSchema = z.object({
  sessionId: z.string(),
  remainingCredits: z.number().nonnegative(),
  maxDurationMinutes: z.number().positive(),
});

export type StartInterviewResult = z.infer<typeof startInterviewResultSchema>;
