export type AuthErrorCode =
  | "token_missing"
  | "token_invalid"
  | "token_expired"
  | "token_kind_mismatch"
  | "username_required"
  | "invalid_credentials"
  | "session_expired"
  | "session_revoked"
  | "session_not_found"
  | "user_not_found"
  | "account_not_found"
  | "otp_not_found"
  | "otp_invalid"
  | "otp_expired"
  | "otp_rate_limited"
  | "otp_too_many_tries"
  | "email_already_exists"
  | "username_taken"
  | "invalid_username"
  | "email_delivery_off"
  | "validation_error"
  | "internal_error"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "unknown";

export interface AuthTokenResponse {
  access_token: string;
  refresh_token: string;
  access_expires_in: number;
  refresh_expires_in: number;
  token_type: "Bearer";
}

export interface User {
  id: number;
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

export interface VerifyEmailOTPResponse {
  user: User;
}

export interface UsernameAvailability {
  username: string;
  available: boolean;
}

export interface AuthProviderConfig {
  apiBaseUrl?: string;
}

export type OAuthProvider = "google" | "discord";
