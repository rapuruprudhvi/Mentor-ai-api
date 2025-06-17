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
      }),

    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(50, 'Password must be less than 100 characters'),

    confirmPassword: z
      .string()
      .min(6, 'Confirm password must be at least 6 characters'),

    emailVerified: z
      .boolean({ required_error: 'emailVerified is required' }),

    mobileNumberVerified: z
      .boolean({ required_error: 'mobileNumberVerified is required' }),
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
  mobileNumber: string;
  createdAt?: string;
}

export interface SignupResponse {
  message: string;
  token: string;
  user: UserResponse;
}
