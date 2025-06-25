import { z } from "zod";

export const startInterviewResultSchema = z.object({
  sessionId: z.string(),
  remainingCredits: z.number().nonnegative(),
  maxDurationMinutes: z.number().positive(),
});

export type StartInterviewResult = z.infer<typeof startInterviewResultSchema>;

export const interviewQuestionSchema = z.object({
  question: z.string(),
  timestamp: z.number(),
});

export type InterviewQuestion = z.infer<typeof interviewQuestionSchema>;

export const interviewAnswerSchema = z.object({
  answer: z.string(),
  timestamp: z.number(),
  processingTime: z.number().nonnegative(),
  promptId: z.string(),
});

export type InterviewAnswer = z.infer<typeof interviewAnswerSchema>;
