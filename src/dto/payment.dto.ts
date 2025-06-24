import { z } from "zod";

export const createCheckoutSessionSchema = z.object({
  planId: z.string().min(1, "Plan ID is required"),
  userId: z.string().min(1, "User ID is required"),
});

export type PlanDto = {
  id: string;
  name: string;
  priceInCents: number;
  label: string;
  features: string[];
  actionLabel: string;
  popular: boolean;
  credits: number;
  isFree: boolean;
  formattedPrice?: string;
  currency?: string;
  symbol?: string;
  description?: string;
  amount?: number;
};

export type CreateCheckoutSessionInput = z.infer<
  typeof createCheckoutSessionSchema
>;

export const checkoutSessionResultSchema = z.object({
  sessionId: z.string(),
  url: z.string().url("Invalid URL"),
});

export type CheckoutSessionResult = z.infer<typeof checkoutSessionResultSchema>;

export const paymentVerificationResultSchema = z.object({
  success: z.boolean(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    interviewCredits: z.number().nonnegative(),
  }),
});

export type PaymentVerificationResult = z.infer<
  typeof paymentVerificationResultSchema
>;
