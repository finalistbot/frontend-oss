import {
  APIClient,
  APIError,
  type APIResponse,
  type RequestConfig,
} from "./api-client";
import type { AuthErrorCode } from "../types/auth-types";

interface ParsedErrorPayload {
  code?: string;
  message?: string;
  details?: unknown;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toAuthErrorCode(status: number, code?: string): AuthErrorCode {
  if (code) return code as AuthErrorCode;
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  return "unknown";
}

function extractErrorPayload(payload: unknown): ParsedErrorPayload {
  if (!isPlainObject(payload)) {
    return typeof payload === "string" ? { message: payload } : {};
  }

  const errorField = payload.error;
  if (typeof errorField === "string") {
    return {
      code: typeof payload.code === "string" ? payload.code : undefined,
      message: errorField,
      details: payload.details,
    };
  }

  if (isPlainObject(errorField)) {
    return {
      code: typeof errorField.code === "string" ? errorField.code : undefined,
      message: typeof errorField.message === "string" ? errorField.message : undefined,
      details: errorField.details,
    };
  }

  return {
    code: typeof payload.code === "string" ? payload.code : undefined,
    message: typeof payload.message === "string" ? payload.message : undefined,
    details: payload.details,
  };
}

export class AuthAPIError extends Error {
  status: number;
  code: AuthErrorCode;
  details: unknown;

  constructor(status: number, payload: unknown) {
    const parsed = extractErrorPayload(payload);
    super(parsed.message ?? `Authentication request failed (${status})`);
    this.name = "AuthAPIError";
    this.status = status;
    this.code = toAuthErrorCode(status, parsed.code);
    this.details = parsed.details;
  }
}

export class SharedAuthAPIClient {
  private readonly client: APIClient;
  private readonly onUsernameRequired?: () => void;

  constructor(
    baseUrl: string,
    refreshSession: () => Promise<void>,
    onUsernameRequired?: () => void,
    onUnauthorized?: () => void,
  ) {
    this.onUsernameRequired = onUsernameRequired;
    this.client = new APIClient({
      baseUrl,
      refreshSession,
      onUnauthorized,
    });
  }

  async get<T>(path: string, options: Omit<RequestConfig, "method"> = {}): Promise<T> {
    return this.unwrap(this.client.get<T>(path, options));
  }

  async post<T>(path: string, options: Omit<RequestConfig, "method"> = {}): Promise<T> {
    return this.unwrap(this.client.post<T>(path, options));
  }

  async patch<T>(path: string, options: Omit<RequestConfig, "method"> = {}): Promise<T> {
    return this.unwrap(this.client.patch<T>(path, options));
  }

  clearSession() {
    return;
  }

  async refreshSession() {
    await this.client.refreshSession();
  }

  private async unwrap<T>(request: Promise<APIResponse<T>>): Promise<T> {
    try {
      const response = await request;
      return response.data;
    } catch (error) {
      if (error instanceof APIError) {
        const authError = new AuthAPIError(error.status, error.data);

        if (authError.code === "username_required") {
          this.onUsernameRequired?.();
        }

        throw authError;
      }

      throw error;
    }
  }
}

export function getAuthErrorCode(error: unknown): AuthErrorCode {
  if (error instanceof AuthAPIError) {
    return error.code;
  }

  return "unknown";
}
