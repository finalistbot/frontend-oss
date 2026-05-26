// Centralised query keys per module so invalidations are uniform.
// Each factory returns readonly tuples — pass them straight into
// QueryClient.invalidateQueries({ queryKey: keys.teams.detail(id) }).

export const queryKeys = {
  identity: {
    me: ["identity", "me"] as const,
    usernameAvailability: (username: string) =>
      ["identity", "username-availability", username] as const,
  },

  users: {
    gameIdentities: ["users", "game-identities"] as const,
    gameIdentity: (gameId: number) => ["users", "game-identity", gameId] as const,
  },

  teams: {
    mine: (page?: number, limit?: number) =>
      ["teams", "mine", { page, limit }] as const,
    detail: (id: number) => ["teams", "detail", id] as const,
    members: (id: number) => ["teams", "members", id] as const,
    myRequests: ["teams", "my-requests"] as const,
    incomingRequests: (teamId: number) =>
      ["teams", "incoming-requests", teamId] as const,
    invites: (teamId: number) => ["teams", "invites", teamId] as const,
    invitePreview: (token: string) => ["teams", "invite-preview", token] as const,
  },

  organizations: {
    mine: (page?: number, limit?: number) =>
      ["organizations", "mine", { page, limit }] as const,
    detail: (id: number) => ["organizations", "detail", id] as const,
    members: (id: number) => ["organizations", "members", id] as const,
    invites: (id: number, page?: number, limit?: number) =>
      ["organizations", "invites", id, { page, limit }] as const,
    myInvites: (page?: number, limit?: number) =>
      ["organizations", "my-invites", { page, limit }] as const,
    teamBans: (id: number, page?: number, limit?: number) =>
      ["organizations", "team-bans", id, { page, limit }] as const,
    playerBans: (id: number, page?: number, limit?: number) =>
      ["organizations", "player-bans", id, { page, limit }] as const,
  },

  catalog: {
    games: (query?: Record<string, unknown>) => ["catalog", "games", query] as const,
    game: (idOrSlug: string | number) => ["catalog", "game", idOrSlug] as const,
    modes: (idOrSlug: string | number, activeOnly?: boolean) =>
      ["catalog", "modes", idOrSlug, activeOnly] as const,
    mapsByGame: (idOrSlug: string | number, activeOnly?: boolean) =>
      ["catalog", "maps-by-game", idOrSlug, activeOnly] as const,
    mapsByMode: (modeId: number, activeOnly?: boolean) =>
      ["catalog", "maps-by-mode", modeId, activeOnly] as const,
  },

  scrims: {
    list: (query?: Record<string, unknown>) => ["scrims", "list", query] as const,
    detail: (id: number) => ["scrims", "detail", id] as const,
    byPublicId: (publicId: string) => ["scrims", "public", publicId] as const,
    byInviteCode: (code: string) => ["scrims", "invite", code] as const,
  },

  presets: {
    list: (query?: Record<string, unknown>) => ["presets", "list", query] as const,
    detail: (id: number) => ["presets", "detail", id] as const,
    maps: (id: number) => ["presets", "maps", id] as const,
  },

  match: {
    detail: (id: number) => ["match", "detail", id] as const,
    byScrim: (scrimId: number) => ["match", "by-scrim", scrimId] as const,
  },

  registrations: {
    teams: (scrimId: number, page?: number, limit?: number) =>
      ["registrations", "teams", scrimId, { page, limit }] as const,
    slots: (scrimId: number) => ["registrations", "slots", scrimId] as const,
    waitlist: (scrimId: number) => ["registrations", "waitlist", scrimId] as const,
    members: (registeredTeamId: number) =>
      ["registrations", "members", registeredTeamId] as const,
    filterLog: (scrimId: number, page?: number, limit?: number) =>
      ["registrations", "filter-log", scrimId, { page, limit }] as const,
    mine: ["registrations", "mine"] as const,
  },
};
