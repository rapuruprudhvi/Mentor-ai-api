import { z } from "zod";

export const signupSchema = z
  .object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters")
      .max(50, "Name must be less than 50 characters")
      .trim(),

    email: z.string().email("Invalid email format").toLowerCase().trim(),

    mobileNumber: z
      .string()
      .length(10, {
        message: "Mobile number must be exactly 10 digits",
      })
      .optional(),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(50, "Password must be less than 100 characters"),

    confirmPassword: z
      .string()

      .min(6, "Confirm password must be at least 6 characters"),

    recaptchaToken: z.string().min(1, "reCAPTCHA token is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupInput = z.infer<typeof signupSchema>;

export const signinSchema = z.object({
  identifier: z
    .union([
      z.string().email("Invalid email format").trim().toLowerCase(),
      z.string().regex(/^\d{10}$/, "Mobile number must be exactly 10 digits"),
    ])
    .refine((val) => !!val, { message: "Identifier is required" }),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password must be less than 50 characters"),
  recaptchaToken: z.string().min(1, "reCAPTCHA token is required"),
});

export type SigninInput = z.infer<typeof signinSchema>;

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  mobileNumber: string;
  interviewCredits?: number;
  resume?: string;
  resumeInfo?: {
    id: string;
    originalName: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    createdAt: Date;
  } | null;
  role?: string;
  createdAt: Date;
}

export interface SignupResponse {
  message: string;
  token: string;
  user: UserResponse;
}

export const sendOtpSchema = z.object({
  contact: z.string().min(5),
});

export const otpSchema = z.object({
  contact: z.string().min(5),
  otp: z.string().length(6),
});

export type SendOtpSchema = z.infer<typeof sendOtpSchema>;
export type OtpSchema = z.infer<typeof otpSchema>;

export const requestPasswordResetSchema = z.object({
  email: z.string().email("Invalid email"),
  recaptchaToken: z.string().min(1, "reCAPTCHA token is required"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm password must be at least 6 characters"),
    recaptchaToken: z.string().min(1, "reCAPTCHA token is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RequestPasswordResetInput = z.infer<
  typeof requestPasswordResetSchema
>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const updateUserSchema = z
  .object({
    name: z
      .string()
      .min(3, { message: "Name must be at least 3 characters" })
      .optional(),
    email: z.string().email("Invalid email format").optional(),
    mobileNumber: z
      .string()
      .length(10, "Mobile number must be exactly 10 digits")
      .optional(),
    role: z.string().optional(),
    profilePhoto: z.string().optional(),
    currentPassword: z
      .string()
      .min(6, "Current password must be at least 6 characters")
      .optional(),
    changePassword: z
      .string()
      .min(6, "New password must be at least 6 characters")
      .optional(),
    confirmPassword: z
      .string()
      .min(6, "Confirm password must be at least 6 characters")
      .optional(),
    recaptchaToken: z.string().min(1, "reCAPTCHA token is required").optional(),
  })
  .superRefine((data, ctx) => {
    const isUpdatingPassword = !!(
      data.currentPassword ||
      data.changePassword ||
      data.confirmPassword
    );

    // Validate all password fields are provided
    if (
      isUpdatingPassword &&
      (!data.currentPassword || !data.changePassword || !data.confirmPassword)
    ) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: z.ZodIssueCode.custom,
        message:
          "All password fields (current, new, confirm) are required to change password",
      });
    }

    // Validate new password and confirm password match
    if (
      data.changePassword &&
      data.confirmPassword &&
      data.changePassword !== data.confirmPassword
    ) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
      });
    }

    // Validate reCAPTCHA token if updating password
    if (isUpdatingPassword && !data.recaptchaToken) {
      ctx.addIssue({
        path: ["recaptchaToken"],
        code: z.ZodIssueCode.custom,
        message: "reCAPTCHA token is required",
      });
    }
  });

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const createTicketSchema = z.object({
  subject: z.string().min(3).max(100),
  message: z.string().min(10),
});
export type CreateTicketSchema = z.infer<typeof createTicketSchema>;

export interface SupportTicketViewResponse {
  ticket: {
    id: string;
    subject: string;
    message: string;
    status: string;
    createdAt: Date;
  };
  user: {
    id: string;
    name: string;
    email: string;
    mobileNumber?: string;
  };
}
