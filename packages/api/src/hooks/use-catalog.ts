"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../client/provider";
import { catalogEndpoints } from "../endpoints/catalog";
import { queryKeys } from "./query-keys";
import type {
  CreateGameInput,
  CreateGameMapInput,
  CreateGameModeInput,
  ListGamesQuery,
  UpdateGameInput,
  UpdateGameMapInput,
  UpdateGameModeInput,
} from "../types/catalog";

// ----- public reads -----

export function useGames(query?: ListGamesQuery) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.catalog.games(query as Record<string, unknown> | undefined),
    queryFn: () => catalogEndpoints.listGames(api, query),
  });
}

export function useGame(idOrSlug: string | number, options?: { enabled?: boolean }) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.catalog.game(idOrSlug),
    queryFn: () => catalogEndpoints.getGame(api, idOrSlug),
    enabled: options?.enabled !== false && idOrSlug !== "" && idOrSlug !== 0,
  });
}

export function useGameModes(
  idOrSlug: string | number,
  activeOnly?: boolean,
  options?: { enabled?: boolean },
) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.catalog.modes(idOrSlug, activeOnly),
    queryFn: () => catalogEndpoints.listModes(api, idOrSlug, activeOnly),
    enabled: options?.enabled !== false && idOrSlug !== "" && idOrSlug !== 0,
  });
}

export function useGameMaps(
  idOrSlug: string | number,
  activeOnly?: boolean,
  options?: { enabled?: boolean },
) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.catalog.mapsByGame(idOrSlug, activeOnly),
    queryFn: () => catalogEndpoints.listMapsByGame(api, idOrSlug, activeOnly),
    enabled: options?.enabled !== false && idOrSlug !== "" && idOrSlug !== 0,
  });
}

export function useModeMaps(
  modeId: number,
  activeOnly?: boolean,
  options?: { enabled?: boolean },
) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.catalog.mapsByMode(modeId, activeOnly),
    queryFn: () => catalogEndpoints.listMapsByMode(api, modeId, activeOnly),
    enabled: options?.enabled !== false && modeId > 0,
  });
}

// ----- platform admin mutations -----

export function useCreateGame() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateGameInput) => catalogEndpoints.createGame(api, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["catalog", "games"] }),
  });
}

export function useUpdateGame(id: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateGameInput) => catalogEndpoints.updateGame(api, id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
    },
  });
}

export function useDeleteGame(id: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => catalogEndpoints.deleteGame(api, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catalog"] }),
  });
}

export function useForceDeleteGame(id: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => catalogEndpoints.forceDeleteGame(api, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catalog"] }),
  });
}

export function useCreateGameMode(gameId: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateGameModeInput) =>
      catalogEndpoints.createMode(api, gameId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["catalog", "modes", gameId] }),
  });
}

export function useUpdateGameMode(modeId: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateGameModeInput) =>
      catalogEndpoints.updateMode(api, modeId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catalog"] }),
  });
}

export function useDeleteGameMode(modeId: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => catalogEndpoints.deleteMode(api, modeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catalog"] }),
  });
}

export function useCreateGameMap(gameId: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateGameMapInput) =>
      catalogEndpoints.createMap(api, gameId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catalog"] }),
  });
}

export function useUpdateGameMap(mapId: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateGameMapInput) =>
      catalogEndpoints.updateMap(api, mapId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catalog"] }),
  });
}

export function useDeleteGameMap(mapId: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => catalogEndpoints.deleteMap(api, mapId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catalog"] }),
  });
}

export function useLinkModeMap(modeId: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mapId: number) => catalogEndpoints.linkModeMap(api, modeId, mapId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catalog"] }),
  });
}

export function useUnlinkModeMap(modeId: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mapId: number) =>
      catalogEndpoints.unlinkModeMap(api, modeId, mapId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catalog"] }),
  });
}
