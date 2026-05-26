import { AuthAPIError, SharedAuthAPIClient } from "./auth-client";
import {
  requestEmailOTPSchema,
  updateUsernameSchema,
  verifyEmailOTPSchema,
  type RequestEmailOTPInput,
  type UpdateUsernameInput,
  type VerifyEmailOTPInput,
} from "../schemas/auth-schemas";
import type {
  EmailOTPChallenge,
  User,
  VerifyEmailOTPResponse,
  UsernameAvailability,
} from "../types/auth-types";

function isSessionGone(error: unknown) {
  return (
    error instanceof AuthAPIError &&
    (error.status === 401 ||
      error.status === 404 ||
      error.code === "token_kind_mismatch")
  );
}

export class AuthAPI {
  private readonly client: SharedAuthAPIClient;

  constructor(client: SharedAuthAPIClient) {
    this.client = client;
  }

  async requestEmailOTP(input: RequestEmailOTPInput) {
    const payload = requestEmailOTPSchema.parse(input);
    return this.client.post<EmailOTPChallenge>("/api/v1/auth/email/request", {
      body: payload,
      skipAuth: true,
    });
  }

  async verifyEmailOTP(input: VerifyEmailOTPInput) {
    const payload = verifyEmailOTPSchema.parse(input);
    const response = await this.client.post<VerifyEmailOTPResponse>(
      "/api/v1/auth/email/verify",
      {
        body: payload,
        skipAuth: true,
      },
    );

    return response.user;
  }

  async refresh() {
    await this.client.refreshSession();
  }

  async logout() {
    try {
      await this.client.post("/api/v1/auth/logout", {
        body: undefined,
        keepalive: true,
      });
    } finally {
      this.clearSession();
    }
  }

  async getMe() {
    return this.client.get<User>("/api/v1/users/@me");
  }

  async bootstrapUser() {
    try {
      return await this.getMe();
    } catch (error) {
      if (isSessionGone(error)) {
        this.clearSession();
        return null;
      }

      throw error;
    }
  }

  async updateUsername(input: UpdateUsernameInput) {
    const payload = updateUsernameSchema.parse(input);
    return this.client.patch<User>("/api/v1/users/@me/username", {
      body: payload,
    });
  }

  async checkUsernameAvailability(username: string) {
    const payload = updateUsernameSchema.parse({ username });
    const searchParams = new URLSearchParams({ username: payload.username });
    return this.client.get<UsernameAvailability>(
      `/api/v1/users/username-availability?${searchParams.toString()}`,
      {
        skipAuth: true,
      },
    );
  }

  clearSession() {
    this.client.clearSession();
  }
}
