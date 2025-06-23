// src/dto/interview.prompt.dto.ts
import { z } from "zod";

export const CreateInterviewPromptZodSchema = z.object({
  question: z.string().min(1, { message: "Question cannot be empty" }),
});

export type CreateInterviewPrompt = z.infer<typeof CreateInterviewPromptZodSchema>;

// DTO used for output response
export type InterviewPromptDto = {
  id: string;
  question: string;
  answer: string;
  createdAt: string; // ISO string for consistent client consumption
};
