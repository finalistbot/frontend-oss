import type { Int64 } from "./shared";

export interface User {
  id: Int64;
  email: string;
  email_verified: boolean;
  username: string;
  avatar_url: string;
  requires_username: boolean;
}

export interface EmailOTPChallenge {
  challenge_id: string;
  expires_in: number;
}

export interface UsernameAvailability {
  username: string;
  available: boolean;
}

export interface RequestEmailOTPInput {
  email: string;
}

export interface VerifyEmailOTPInput {
  challenge_id: string;
  code: string;
}

export interface UpdateUsernameInput {
  username: string;
}
