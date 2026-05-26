"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../client/provider";
import { scrimEndpoints } from "../endpoints/scrims";
import { queryKeys } from "./query-keys";
import type {
  CreateMatchInput,
  CreatePresetInput,
  CreateScrimInput,
  ListPresetsQuery,
  ListScrimsQuery,
  PresetMapInput,
  UpdateMatchInput,
  UpdatePresetInput,
  UpdatePresetStatusInput,
  UpdateScrimInput,
} from "../types/scrims";

// ----- scrim queries -----

export function useScrims(query?: ListScrimsQuery) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.scrims.list(query as Record<string, unknown> | undefined),
    queryFn: () => scrimEndpoints.list(api, query),
  });
}

export function useScrim(id: number, options?: { enabled?: boolean }) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.scrims.detail(id),
    queryFn: () => scrimEndpoints.get(api, id),
    enabled: options?.enabled !== false && id > 0,
  });
}

export function useScrimByPublicId(publicId: string, options?: { enabled?: boolean }) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.scrims.byPublicId(publicId),
    queryFn: () => scrimEndpoints.getByPublicId(api, publicId),
    enabled: options?.enabled !== false && Boolean(publicId),
  });
}

export function useScrimByInviteCode(code: string, options?: { enabled?: boolean }) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.scrims.byInviteCode(code),
    queryFn: () => scrimEndpoints.getByInviteCode(api, code),
    enabled: options?.enabled !== false && Boolean(code),
  });
}

// ----- scrim mutations -----

export function useCreateScrim() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateScrimInput) => scrimEndpoints.create(api, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["scrims", "list"] }),
  });
}

export function useUpdateScrim(id: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateScrimInput) => scrimEndpoints.update(api, id, body),
    onSuccess: (scrim) => {
      queryClient.setQueryData(queryKeys.scrims.detail(id), scrim);
      queryClient.invalidateQueries({ queryKey: ["scrims", "list"] });
    },
  });
}

export function useDeleteScrim(id: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => scrimEndpoints.delete(api, id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.scrims.detail(id) });
      queryClient.invalidateQueries({ queryKey: ["scrims", "list"] });
    },
  });
}

// ----- scrim lifecycle transitions -----

function makeScrimAction(
  fn: (api: ReturnType<typeof useApiClient>, id: number) => Promise<unknown>,
) {
  return function useScrimAction(id: number) {
    const api = useApiClient();
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: () => fn(api, id) as ReturnType<typeof scrimEndpoints.start>,
      onSuccess: (scrim) => {
        queryClient.setQueryData(queryKeys.scrims.detail(id), scrim);
        queryClient.invalidateQueries({ queryKey: ["scrims", "list"] });
      },
    });
  };
}

export const usePromoteScrim = makeScrimAction(scrimEndpoints.promote);
export const useOpenScrimRegistration = makeScrimAction(scrimEndpoints.openRegistration);
export const useCloseScrimRegistration = makeScrimAction(scrimEndpoints.closeRegistration);
export const useStartScrim = makeScrimAction(scrimEndpoints.start);
export const useEndScrim = makeScrimAction(scrimEndpoints.end);
export const useCancelScrim = makeScrimAction(scrimEndpoints.cancel);

// ----- presets -----

export function usePresets(query?: ListPresetsQuery) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.presets.list(query as Record<string, unknown> | undefined),
    queryFn: () => scrimEndpoints.listPresets(api, query),
  });
}

export function usePreset(id: number, options?: { enabled?: boolean }) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.presets.detail(id),
    queryFn: () => scrimEndpoints.getPreset(api, id),
    enabled: options?.enabled !== false && id > 0,
  });
}

export function usePresetMaps(id: number, options?: { enabled?: boolean }) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.presets.maps(id),
    queryFn: () => scrimEndpoints.listPresetMaps(api, id),
    enabled: options?.enabled !== false && id > 0,
  });
}

export function useCreatePreset() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePresetInput) => scrimEndpoints.createPreset(api, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["presets", "list"] }),
  });
}

export function useUpdatePreset(id: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdatePresetInput) =>
      scrimEndpoints.updatePreset(api, id, body),
    onSuccess: (preset) => {
      queryClient.setQueryData(queryKeys.presets.detail(id), preset);
      queryClient.invalidateQueries({ queryKey: ["presets", "list"] });
    },
  });
}

export function useUpdatePresetStatus(id: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdatePresetStatusInput) =>
      scrimEndpoints.updatePresetStatus(api, id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presets"] });
      queryClient.invalidateQueries({ queryKey: ["scrims"] });
    },
  });
}

export function useDeletePreset(id: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => scrimEndpoints.deletePreset(api, id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.presets.detail(id) });
      queryClient.invalidateQueries({ queryKey: ["presets", "list"] });
    },
  });
}

export function useAddPresetMap(presetId: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: PresetMapInput) =>
      scrimEndpoints.addPresetMap(api, presetId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.presets.maps(presetId) }),
  });
}

export function useUpdatePresetMapOrder(presetId: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mapId, body }: { mapId: number; body: PresetMapInput }) =>
      scrimEndpoints.updatePresetMapOrder(api, presetId, mapId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.presets.maps(presetId) }),
  });
}

export function useRemovePresetMap(presetId: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mapId: number) =>
      scrimEndpoints.removePresetMap(api, presetId, mapId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.presets.maps(presetId) }),
  });
}

// ----- match -----

export function useMatch(id: number, options?: { enabled?: boolean }) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.match.detail(id),
    queryFn: () => scrimEndpoints.getMatch(api, id),
    enabled: options?.enabled !== false && id > 0,
  });
}

export function useMatchByScrim(scrimId: number, options?: { enabled?: boolean }) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.match.byScrim(scrimId),
    queryFn: () => scrimEndpoints.getMatchByScrim(api, scrimId),
    enabled: options?.enabled !== false && scrimId > 0,
  });
}

export function useCreateMatch() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateMatchInput) => scrimEndpoints.createMatch(api, body),
    onSuccess: (match) => {
      queryClient.setQueryData(queryKeys.match.byScrim(match.scrim_id), match);
      queryClient.setQueryData(queryKeys.match.detail(match.id), match);
    },
  });
}

export function useUpdateMatchMap(id: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateMatchInput) =>
      scrimEndpoints.updateMatchMap(api, id, body),
    onSuccess: (match) => {
      queryClient.setQueryData(queryKeys.match.detail(id), match);
      queryClient.setQueryData(queryKeys.match.byScrim(match.scrim_id), match);
    },
  });
}

export function useStartMatch(id: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => scrimEndpoints.startMatch(api, id),
    onSuccess: (match) => {
      queryClient.setQueryData(queryKeys.match.detail(id), match);
      queryClient.setQueryData(queryKeys.match.byScrim(match.scrim_id), match);
    },
  });
}

export function useEndMatch(id: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => scrimEndpoints.endMatch(api, id),
    onSuccess: (match) => {
      queryClient.setQueryData(queryKeys.match.detail(id), match);
      queryClient.setQueryData(queryKeys.match.byScrim(match.scrim_id), match);
    },
  });
}

export function useDeleteMatch(id: number, scrimId?: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => scrimEndpoints.deleteMatch(api, id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.match.detail(id) });
      if (scrimId) {
        queryClient.removeQueries({ queryKey: queryKeys.match.byScrim(scrimId) });
      }
    },
  });
}
