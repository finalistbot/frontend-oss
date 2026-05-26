import type { ApiClient } from "../client/client";
import type {
  PlatformLoginInput,
  PlatformLoginResponse,
  PlatformRefreshInput,
  PlatformRefreshResponse,
  PlatformUser,
} from "../types/platform";

const base = "/api/v1/platform";

// Platform admin auth uses bearer tokens (no cookies). Caller must attach
// `Authorization: Bearer <access>` on subsequent calls — this is by design and
// distinct from the user-side cookie auth.
export const platformEndpoints = {
  login: (api: ApiClient, body: PlatformLoginInput) =>
    api.post<PlatformLoginResponse>(`${base}/auth/login`, { body, skipAuth: true }),

  refresh: (api: ApiClient, body: PlatformRefreshInput) =>
    api.post<PlatformRefreshResponse>(`${base}/auth/refresh`, { body, skipAuth: true }),

  logout: (api: ApiClient, accessToken: string) =>
    api.post<{ message: string }>(`${base}/auth/logout`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      skipAuth: true,
    }),

  me: (api: ApiClient, accessToken: string) =>
    api.get<PlatformUser>(`${base}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      skipAuth: true,
    }),
};
