"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../client/provider";
import { userEndpoints } from "../endpoints/users";
import { queryKeys } from "./query-keys";
import type { SetGameIdentityInput } from "../types/users";

export function useGameIdentities() {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.users.gameIdentities,
    queryFn: () => userEndpoints.listGameIdentities(api),
  });
}

export function useGameIdentity(gameId: number, options?: { enabled?: boolean }) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.users.gameIdentity(gameId),
    queryFn: () => userEndpoints.getGameIdentity(api, gameId),
    enabled: options?.enabled !== false && gameId > 0,
  });
}

export function useSetGameIdentity(gameId: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SetGameIdentityInput) =>
      userEndpoints.setGameIdentity(api, gameId, body),
    onSuccess: (identity) => {
      queryClient.setQueryData(queryKeys.users.gameIdentity(gameId), identity);
      queryClient.invalidateQueries({ queryKey: queryKeys.users.gameIdentities });
    },
  });
}

export function useDeleteGameIdentity(gameId: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => userEndpoints.deleteGameIdentity(api, gameId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.users.gameIdentity(gameId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.gameIdentities });
    },
  });
}

export function useUploadImage() {
  const api = useApiClient();
  return useMutation({
    mutationFn: ({ file, filename }: { file: File | Blob; filename?: string }) =>
      userEndpoints.uploadImage(api, file, filename),
  });
}
