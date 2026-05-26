"use client";

import { useEffect, useRef } from "react";
import { RealtimeSocket } from "../realtime/socket";
import type { ServerEvent } from "../types/realtime";

export interface UseRealtimeOptions {
  apiBaseUrl: string;
  // Pass null while waiting on auth bootstrap. Omit/undefined to use cookie
  // auth, or pass a token for non-browser clients.
  token?: string | null;
  topics?: string[];
  reconnect?: boolean;
  onEvent?: (event: ServerEvent) => void;
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
}

// Persistent WebSocket bound to a token + topic list. Reopens on token change.
// Caller-supplied callbacks are stored in refs so they can update without
// tearing down the socket.
export function useRealtime({
  apiBaseUrl,
  token,
  topics,
  reconnect = true,
  onEvent,
  onOpen,
  onClose,
  onError,
}: UseRealtimeOptions) {
  const socketRef = useRef<RealtimeSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const topicsRef = useRef(topics);
  const handlersRef = useRef({ onEvent, onOpen, onClose, onError });
  topicsRef.current = topics;
  handlersRef.current = { onEvent, onOpen, onClose, onError };

  useEffect(() => {
    if (token === null) return undefined;
    let closedByHook = false;
    let retry = 0;

    function clearReconnectTimer() {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    }

    function connect() {
      const socket = new RealtimeSocket({
        apiBaseUrl,
        token,
        onEvent: (e) => handlersRef.current.onEvent?.(e),
        onOpen: () => {
          retry = 0;
          topicsRef.current?.forEach((t) => socket.subscribe(t));
          handlersRef.current.onOpen?.();
        },
        onClose: (e) => {
          socketRef.current = null;
          handlersRef.current.onClose?.(e);
          if (!closedByHook && reconnect) {
            const delay = Math.min(1000 * 2 ** retry, 15000);
            retry += 1;
            reconnectTimerRef.current = setTimeout(connect, delay);
          }
        },
        onError: (e) => handlersRef.current.onError?.(e),
      });
      socket.open();
      socketRef.current = socket;
    }

    connect();

    return () => {
      closedByHook = true;
      clearReconnectTimer();
      socketRef.current?.close();
      socketRef.current = null;
    };
    // Topics deliberately left out — tracked via separate effect below.
  }, [apiBaseUrl, reconnect, token]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !topics) return;
    topics.forEach((t) => socket.subscribe(t));
    return () => {
      topics.forEach((t) => socket.unsubscribe(t));
    };
  }, [topics]);

  return socketRef;
}
