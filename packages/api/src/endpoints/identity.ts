import type { ApiClient } from "../client/client";
import type {
  EmailOTPChallenge,
  RequestEmailOTPInput,
  UpdateUsernameInput,
  User,
  UsernameAvailability,
  VerifyEmailOTPInput,
} from "../types/identity";

const base = "/api/v1";

export const identityEndpoints = {
  // Auth flows write HttpOnly cookies on the response — no token returned in body.
  requestEmailOTP: (api: ApiClient, body: RequestEmailOTPInput) =>
    api.post<EmailOTPChallenge>(`${base}/auth/email/request`, { body, skipAuth: true }),

  verifyEmailOTP: (api: ApiClient, body: VerifyEmailOTPInput) =>
    api.post<{ user: User }>(`${base}/auth/email/verify`, { body, skipAuth: true }),

  refresh: (api: ApiClient) =>
    api.post<{ message: string }>(`${base}/auth/refresh`, { skipAuth: true }),

  logout: (api: ApiClient) =>
    api.post<{ message: string }>(`${base}/auth/logout`),

  me: (api: ApiClient) => api.get<User>(`${base}/users/@me`),

  setUsername: (api: ApiClient, body: UpdateUsernameInput) =>
    api.patch<User>(`${base}/users/@me/username`, { body }),

  checkUsernameAvailability: (api: ApiClient, username: string) =>
    api.get<UsernameAvailability>(`${base}/users/username-availability`, {
      query: { username },
      skipAuth: true,
    }),
};
