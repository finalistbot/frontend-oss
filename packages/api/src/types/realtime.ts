// Outbound (server → client) event envelope.
export interface ServerEvent<T = unknown> {
  type: string;
  topic: string;
  data: T;
}

// Inbound (client → server) command envelope.
export interface ClientCommand {
  action: "subscribe" | "unsubscribe";
  topic: string;
}

// Common topic builders for the events the backend publishes (scrim status +
// registration, team membership). See backend docs/realtime.md.
export const topics = {
  user: (id: number) => `user:${id}`,
  scrim: (id: number) => `scrim:${id}`,
  team: (id: number) => `team:${id}`,
  org: (id: number) => `org:${id}`,
  match: (id: number) => `match:${id}`,
};
