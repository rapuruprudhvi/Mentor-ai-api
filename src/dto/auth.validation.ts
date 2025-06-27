import { z } from "zod";

export const signupSchema = z
  .object({
    name: z
      .string()
      .min(3, 'Name must be at least 3 characters')
      .max(50, 'Name must be less than 50 characters')
      .trim(),

    email: z
      .string()
      .email('Invalid email format')
      .toLowerCase()
      .trim(),

    mobileNumber: z
      .string()
      .length(10, {
        message: 'Mobile number must be exactly 10 digits',
      })
      .optional(),

    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(50, 'Password must be less than 100 characters'),

    confirmPassword: z
      .string()
      .min(6, 'Confirm password must be at least 6 characters'),

  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SignupInput = z.infer<typeof signupSchema>;

export const signinSchema = z.object({
  identifier: z
    .union([
      z
        .string()
        .email("Invalid email format")
        .trim()
        .toLowerCase(),
      z
        .string()
        .regex(/^\d{10}$/, "Mobile number must be exactly 10 digits"),
    ])
    .refine((val) => !!val, { message: "Identifier is required" }),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password must be less than 50 characters"),
});

export type SigninInput = z.infer<typeof signinSchema>;
  
export interface UserResponse {
  id: string;
  name: string;
  email: string;
  mobileNumber?: string;
  role?:string;
  profilePicture?:string;
  interviewCredits?:number;
  createdAt?: Date;
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
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const updateUserSchema = z
  .object({
    name: z.string().min(3, { message: "Name must be at least 3 characters" }).optional(),
    email: z.string().email("Invalid email format").optional(),
    mobileNumber: z.string().length(10, "Mobile number must be exactly 10 digits").optional(),
    role: z.string().optional(),
    profilePhoto: z.string().optional(),
    currentPassword: z.string().min(6, "Current password must be at least 6 characters").optional(),
    changePassword: z.string().min(6, "New password must be at least 6 characters").optional(),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters").optional(),
  })
  .refine((data) => {
    const anyPasswordField = data.currentPassword || data.changePassword || data.confirmPassword;
    const allProvided = data.currentPassword && data.changePassword && data.confirmPassword;
    return !anyPasswordField || allProvided;
  }, {
    message: "All password fields (current, new, confirm) are required to change password",
    path: ["currentPassword"],
  })
  .refine((data) => {
    if (data.changePassword && data.confirmPassword) {
      return data.changePassword === data.confirmPassword;
    }
    return true;
  }, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
