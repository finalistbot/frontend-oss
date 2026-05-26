import { z } from "zod";

export const requestEmailOTPSchema = z.object({
  email: z.email("Enter a valid email address"),
});

export const verifyEmailOTPSchema = z.object({
  challenge_id: z.string().trim().min(1, "Challenge is required"),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code sent to your email"),
});

export const updateUsernameSchema = z.object({
  username: z
    .string()
    .trim()
    .regex(
      /^[A-Za-z0-9][A-Za-z0-9._-]{2,31}$/,
      "Use 3-32 characters with letters, numbers, dots, underscores, or hyphens",
    ),
});

export type RequestEmailOTPInput = z.infer<typeof requestEmailOTPSchema>;
export type VerifyEmailOTPInput = z.infer<typeof verifyEmailOTPSchema>;
export type UpdateUsernameInput = z.infer<typeof updateUsernameSchema>;
