import { z } from "zod";

export const CreateInterviewPromptZodSchema = z.object({
  question: z.string().min(1, { message: "Question cannot be empty" }),
});

export type CreateInterviewPrompt = z.infer<typeof CreateInterviewPromptZodSchema>;
