// All non-2xx responses come back as ApiError. `code` is the backend's stable
// snake_case error code (see backend docs/auth.md and per-module docs).
export class ApiError extends Error {
  status: number;
  code: string;
  details?: Record<string, string[]>;
  raw: unknown;

  constructor(status: number, raw: unknown, fallback?: string) {
    const parsed = parseErrorPayload(raw);
    super(parsed.message ?? fallback ?? `Request failed (${status})`);
    this.name = "ApiError";
    this.status = status;
    this.code = parsed.code ?? defaultCodeForStatus(status);
    this.details = parsed.details;
    this.raw = raw;
  }
}

interface ParsedError {
  code?: string;
  message?: string;
  details?: Record<string, string[]>;
}

function parseErrorPayload(payload: unknown): ParsedError {
  if (!payload || typeof payload !== "object") {
    return typeof payload === "string" ? { message: payload } : {};
  }

  const obj = payload as Record<string, unknown>;
  return {
    code: typeof obj.code === "string" ? obj.code : undefined,
    message: typeof obj.error === "string" ? obj.error : undefined,
    details:
      obj.details && typeof obj.details === "object"
        ? (obj.details as Record<string, string[]>)
        : undefined,
  };
}

function defaultCodeForStatus(status: number): string {
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  if (status === 422 || status === 400) return "validation_error";
  if (status >= 500) return "internal_error";
  return "unknown";
}

// Type guard for switch-on-code consumers.
export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}
