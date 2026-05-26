import type { Int64 } from "./shared";

export interface PlatformUser {
  id: Int64;
  email: string;
  username: string;
  avatar_url?: string;
  active: boolean;
}

export interface PlatformTokens {
  access_token: string;
  refresh_token: string;
  access_expires_in: number;
  refresh_expires_in: number;
  token_type: "Bearer";
}

export interface PlatformLoginResponse {
  user: PlatformUser;
  tokens: PlatformTokens;
}

export interface PlatformLoginInput {
  email: string;
  password: string;
}

export interface PlatformRefreshInput {
  refresh_token: string;
}

export interface PlatformRefreshResponse {
  tokens: PlatformTokens;
}
