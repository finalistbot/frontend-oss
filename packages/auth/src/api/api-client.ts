export type RequestConfig = Omit<RequestInit, "body"> & {
  skipAuth?: boolean;
  headers?: Record<string, string>;
  body?: RequestInit["body"] | Record<string, unknown>;
};

type SimpleRequestConfig = Omit<RequestConfig, "method" | "body">;
type RequestWithBodyConfig = Omit<RequestConfig, "method">;

type APIClientConfig = {
  baseUrl: string;
  refreshSession: () => Promise<void>;
  onUnauthorized?: () => void;
};

export class APIResponse<T> {
  data: T;
  status: number;
  raw: Response;

  constructor(response: Response, data: T) {
    this.raw = response;
    this.status = response.status;
    this.data = data;
  }
}

export class APIError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, data: unknown) {
    super(`API Error: ${status}`);
    this.status = status;
    this.data = data;
  }
}

function mergeHeaders(
  defaultHeaders: Record<string, string>,
  customHeaders?: Record<string, string>,
) {
  return { ...defaultHeaders, ...(customHeaders ?? {}) };
}

function parseBody(
  body: RequestConfig["body"],
  headers: Record<string, string>,
): BodyInit | undefined {
  if (body == null) {
    return undefined;
  }

  if (
    typeof body === "string" ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof Blob ||
    body instanceof ArrayBuffer
  ) {
    return body;
  }

  if (headers["Content-Type"]?.includes("application/json")) {
    return JSON.stringify(body);
  }

  return body as BodyInit;
}

export class APIClient {
  private readonly baseUrl: string;
  private readonly refreshSessionFn: () => Promise<void>;
  private readonly onUnauthorized?: () => void;

  constructor(config: APIClientConfig) {
    this.baseUrl = config.baseUrl.endsWith("/")
      ? config.baseUrl.slice(0, -1)
      : config.baseUrl;
    this.refreshSessionFn = config.refreshSession;
    this.onUnauthorized = config.onUnauthorized;
  }

  async request<T = unknown>(
    endpoint: string,
    config: RequestConfig,
    retryCount: number = 0,
  ): Promise<APIResponse<T>> {
    const { skipAuth, ...fetchConfig } = config;
    const headers = mergeHeaders(
      {
        "Content-Type": "application/json",
      },
      fetchConfig.headers,
    );

    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...fetchConfig,
      credentials: fetchConfig.credentials ?? "include",
      headers,
      body: parseBody(fetchConfig.body, headers),
      cache: "no-store",
    });

    if (response.status === 401 && retryCount === 0 && !skipAuth) {
      try {
        await this.refreshSessionFn();
        return this.request<T>(endpoint, { ...config, headers }, retryCount + 1);
      } catch {
        this.onUnauthorized?.();
      }
    }

    const contentType = response.headers.get("Content-Type");
    const data =
      contentType && contentType.includes("application/json")
        ? await response.json()
        : await response.text();

    if (!response.ok) {
      throw new APIError(response.status, data);
    }

    return new APIResponse<T>(response, data);
  }

  async get<T = unknown>(endpoint: string, config: SimpleRequestConfig = {}) {
    return this.request<T>(endpoint, {
      ...config,
      method: "GET",
    });
  }

  async post<T = unknown>(endpoint: string, config: RequestWithBodyConfig = {}) {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
    });
  }

  async patch<T = unknown>(endpoint: string, config: RequestWithBodyConfig = {}) {
    return this.request<T>(endpoint, {
      ...config,
      method: "PATCH",
    });
  }

  async put<T = unknown>(endpoint: string, config: RequestWithBodyConfig = {}) {
    return this.request<T>(endpoint, {
      ...config,
      method: "PUT",
    });
  }

  async delete<T = unknown>(endpoint: string, config: SimpleRequestConfig = {}) {
    return this.request<T>(endpoint, {
      ...config,
      method: "DELETE",
    });
  }

  async refreshSession() {
    await this.refreshSessionFn();
  }
}
