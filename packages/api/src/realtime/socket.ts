import type { ClientCommand, ServerEvent } from "../types/realtime";

export interface RealtimeSocketOptions {
  // Base API URL — wss/ws scheme is derived automatically from http/https.
  apiBaseUrl: string;
  // Optional access JWT. Browser apps should usually omit this and rely on the
  // HttpOnly access_token cookie being sent during the WebSocket handshake.
  token?: string | null;
  onEvent?: (event: ServerEvent) => void;
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
}

// Build the wss URL from the API base URL.
function toWebSocketUrl(base: string, token?: string | null) {
  const trimmed = base.endsWith("/") ? base.slice(0, -1) : base;
  const wsBase = trimmed.replace(/^http(s)?:/, "ws$1:");
  if (!token) return `${wsBase}/api/v1/ws`;
  const params = new URLSearchParams({ token });
  return `${wsBase}/api/v1/ws?${params.toString()}`;
}

// Thin WebSocket wrapper that handles handshake auth + subscribe/unsubscribe.
// Reconnect is the caller's responsibility (e.g., via a hook); this stays
// stateless beyond a single connection.
export class RealtimeSocket {
  private ws: WebSocket | null = null;
  private readonly options: RealtimeSocketOptions;

  constructor(options: RealtimeSocketOptions) {
    this.options = options;
  }

  open() {
    if (this.ws) return;
    const url = toWebSocketUrl(this.options.apiBaseUrl, this.options.token);
    const ws = new WebSocket(url);

    ws.addEventListener("open", () => this.options.onOpen?.());
    ws.addEventListener("close", (e) => {
      this.ws = null;
      this.options.onClose?.(e);
    });
    ws.addEventListener("error", (e) => this.options.onError?.(e));
    ws.addEventListener("message", (e) => {
      try {
        const event = JSON.parse(e.data as string) as ServerEvent;
        this.options.onEvent?.(event);
      } catch {
        // Drop malformed frames silently — server only sends JSON.
      }
    });

    this.ws = ws;
  }

  close() {
    this.ws?.close();
    this.ws = null;
  }

  subscribe(topic: string) {
    this.send({ action: "subscribe", topic });
  }

  unsubscribe(topic: string) {
    this.send({ action: "unsubscribe", topic });
  }

  private send(command: ClientCommand) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify(command));
  }
}
