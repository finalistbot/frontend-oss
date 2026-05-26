import { appConfig } from "@/config";

export const PENDING_AUTH_REDIRECT_STORAGE_KEY = "finalist.pending_auth_redirect";

// Same-origin default; consolidated app routes /play under the marketing domain.
const DEFAULT_POST_LOGIN_PATH = "/play";

function canUseStorage() {
  return typeof window !== "undefined";
}

export function getDefaultPostLoginUrl() {
  return DEFAULT_POST_LOGIN_PATH;
}

export function getNextTarget(next?: string | null) {
  return next || readPendingRedirectTarget() || getDefaultPostLoginUrl();
}

export function storePendingRedirectTarget(target: string) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(PENDING_AUTH_REDIRECT_STORAGE_KEY, target);
}

export function readPendingRedirectTarget() {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(PENDING_AUTH_REDIRECT_STORAGE_KEY);
}

export function clearPendingRedirectTarget() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(PENDING_AUTH_REDIRECT_STORAGE_KEY);
}

export function buildOAuthLoginUrl(provider: "google" | "discord") {
  const baseUrl = appConfig.apiBaseUrl.endsWith("/")
    ? appConfig.apiBaseUrl.slice(0, -1)
    : appConfig.apiBaseUrl;
  return `${baseUrl}/api/v1/auth/${provider}/login`;
}
