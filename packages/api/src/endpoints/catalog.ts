import type { ApiClient } from "../client/client";
import type { PaginatedResponse } from "../types/shared";
import type {
  CreateGameInput,
  CreateGameMapInput,
  CreateGameModeInput,
  DeleteGameOutcome,
  Game,
  GameMap,
  GameMode,
  ListGamesQuery,
  UpdateGameInput,
  UpdateGameMapInput,
  UpdateGameModeInput,
} from "../types/catalog";

const base = "/api/v1";

// Catalog GETs are public (no auth header). Listed games can also accept the
// `idOrSlug` URL pattern — the backend supports both numeric and slug input.

export const catalogEndpoints = {
  listGames: (api: ApiClient, query?: ListGamesQuery) =>
    api.get<PaginatedResponse<Game>>(`${base}/games`, {
      query,
      skipAuth: true,
    }),

  getGame: (api: ApiClient, idOrSlug: string | number) =>
    api.get<Game>(`${base}/games/${idOrSlug}`, { skipAuth: true }),

  listModes: (api: ApiClient, idOrSlug: string | number, activeOnly?: boolean) =>
    api.get<GameMode[]>(`${base}/games/${idOrSlug}/modes`, {
      query: activeOnly === undefined ? undefined : { active: activeOnly },
      skipAuth: true,
    }),

  listMapsByGame: (api: ApiClient, idOrSlug: string | number, activeOnly?: boolean) =>
    api.get<GameMap[]>(`${base}/games/${idOrSlug}/maps`, {
      query: activeOnly === undefined ? undefined : { active: activeOnly },
      skipAuth: true,
    }),

  listMapsByMode: (api: ApiClient, modeId: number, activeOnly?: boolean) =>
    api.get<GameMap[]>(`${base}/modes/${modeId}/maps`, {
      query: activeOnly === undefined ? undefined : { active: activeOnly },
      skipAuth: true,
    }),

  // ----- platform admin -----

  createGame: (api: ApiClient, body: CreateGameInput) =>
    api.post<Game>(`${base}/platform/catalog/games`, { body }),

  updateGame: (api: ApiClient, id: number, body: UpdateGameInput) =>
    api.patch<Game>(`${base}/platform/catalog/games/${id}`, { body }),

  deleteGame: (api: ApiClient, id: number) =>
    api.delete<DeleteGameOutcome>(`${base}/platform/catalog/games/${id}`),

  forceDeleteGame: (api: ApiClient, id: number) =>
    api.post<void>(`${base}/platform/catalog/games/${id}/force-delete`),

  createMode: (api: ApiClient, gameId: number, body: CreateGameModeInput) =>
    api.post<GameMode>(`${base}/platform/catalog/games/${gameId}/modes`, { body }),

  updateMode: (api: ApiClient, modeId: number, body: UpdateGameModeInput) =>
    api.patch<GameMode>(`${base}/platform/catalog/modes/${modeId}`, { body }),

  deleteMode: (api: ApiClient, modeId: number) =>
    api.delete<void>(`${base}/platform/catalog/modes/${modeId}`),

  createMap: (api: ApiClient, gameId: number, body: CreateGameMapInput) =>
    api.post<GameMap>(`${base}/platform/catalog/games/${gameId}/maps`, { body }),

  updateMap: (api: ApiClient, mapId: number, body: UpdateGameMapInput) =>
    api.patch<GameMap>(`${base}/platform/catalog/maps/${mapId}`, { body }),

  deleteMap: (api: ApiClient, mapId: number) =>
    api.delete<void>(`${base}/platform/catalog/maps/${mapId}`),

  linkModeMap: (api: ApiClient, modeId: number, mapId: number) =>
    api.post<void>(`${base}/platform/catalog/modes/${modeId}/maps/${mapId}`),

  unlinkModeMap: (api: ApiClient, modeId: number, mapId: number) =>
    api.delete<void>(`${base}/platform/catalog/modes/${modeId}/maps/${mapId}`),
};
