import { ApiError } from "./error";

// `object` (not Record<string, unknown>) is intentional — narrow query types
// like `{ page?: number }` are object-literal assignable to `object` but not
// to a Record without an index signature. Values are stringified at runtime.
export type QueryParams = object;

export type RequestOptions = Omit<RequestInit, "body" | "method"> & {
  body?: unknown;
  query?: QueryParams;
  skipAuth?: boolean;
  // Override Content-Type detection for FormData / Blob / etc.
  rawBody?: BodyInit;
};

export interface ApiClientConfig {
  baseUrl: string;
  // Called once on 401; should re-issue cookies via /auth/refresh.
  refreshSession?: () => Promise<void>;
  // Called when refresh fails or no refresh fn is configured.
  onUnauthorized?: () => void;
}

function buildUrl(base: string, path: string, query?: RequestOptions["query"]) {
  const trimmed = base.endsWith("/") ? base.slice(0, -1) : base;
  const fullPath = path.startsWith("/") ? path : `/${path}`;
  if (!query) return `${trimmed}${fullPath}`;

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query as Record<string, unknown>)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item === undefined || item === null) continue;
        search.append(key, String(item));
      }
      continue;
    }
    search.append(key, String(value));
  }
  const qs = search.toString();
  return qs ? `${trimmed}${fullPath}?${qs}` : `${trimmed}${fullPath}`;
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly refreshSession?: () => Promise<void>;
  private readonly onUnauthorized?: () => void;
  // Coalesce concurrent refreshes — multiple in-flight requests hitting 401
  // should only kick off one refresh.
  private inFlightRefresh: Promise<void> | null = null;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.refreshSession = config.refreshSession;
    this.onUnauthorized = config.onUnauthorized;
  }

  async request<T>(
    method: string,
    path: string,
    options: RequestOptions = {},
    retry = 0,
  ): Promise<T> {
    const { body, rawBody, query, skipAuth, headers, ...rest } = options;
    const headerMap: Record<string, string> = { ...(headers as Record<string, string> | undefined) };

    let payload: BodyInit | undefined;
    if (rawBody !== undefined) {
      payload = rawBody;
    } else if (body !== undefined) {
      headerMap["Content-Type"] ??= "application/json";
      payload = JSON.stringify(body);
    }

    const response = await fetch(buildUrl(this.baseUrl, path, query), {
      ...rest,
      method,
      headers: headerMap,
      body: payload,
      credentials: rest.credentials ?? "include",
      cache: "no-store",
    });

    if (response.status === 401 && !skipAuth && retry === 0 && this.refreshSession) {
      try {
        await this.coalescedRefresh();
        return this.request<T>(method, path, options, retry + 1);
      } catch {
        this.onUnauthorized?.();
      }
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get("Content-Type") ?? "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      throw new ApiError(response.status, data);
    }

    return data as T;
  }

  get<T>(path: string, options?: RequestOptions) {
    return this.request<T>("GET", path, options);
  }
  post<T>(path: string, options?: RequestOptions) {
    return this.request<T>("POST", path, options);
  }
  put<T>(path: string, options?: RequestOptions) {
    return this.request<T>("PUT", path, options);
  }
  patch<T>(path: string, options?: RequestOptions) {
    return this.request<T>("PATCH", path, options);
  }
  delete<T>(path: string, options?: RequestOptions) {
    return this.request<T>("DELETE", path, options);
  }

  private async coalescedRefresh() {
    if (!this.refreshSession) {
      throw new Error("no refresh session configured");
    }
    if (this.inFlightRefresh) return this.inFlightRefresh;

    this.inFlightRefresh = this.refreshSession().finally(() => {
      this.inFlightRefresh = null;
    });
    return this.inFlightRefresh;
  }
}
