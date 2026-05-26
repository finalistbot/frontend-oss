"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../client/provider";
import { identityEndpoints } from "../endpoints/identity";
import { queryKeys } from "./query-keys";
import type {
  RequestEmailOTPInput,
  UpdateUsernameInput,
  VerifyEmailOTPInput,
} from "../types/identity";

export function useMe(options?: { enabled?: boolean }) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.identity.me,
    queryFn: () => identityEndpoints.me(api),
    enabled: options?.enabled,
  });
}

export function useUsernameAvailability(username: string, options?: { enabled?: boolean }) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.identity.usernameAvailability(username),
    queryFn: () => identityEndpoints.checkUsernameAvailability(api, username),
    enabled: options?.enabled !== false && username.trim().length >= 3,
  });
}

export function useRequestEmailOTP() {
  const api = useApiClient();
  return useMutation({
    mutationFn: (input: RequestEmailOTPInput) =>
      identityEndpoints.requestEmailOTP(api, input),
  });
}

export function useVerifyEmailOTP() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: VerifyEmailOTPInput) =>
      identityEndpoints.verifyEmailOTP(api, input),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.identity.me, data.user);
    },
  });
}

export function useSetUsername() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateUsernameInput) =>
      identityEndpoints.setUsername(api, input),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.identity.me, user);
    },
  });
}

export function useLogout() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => identityEndpoints.logout(api),
    onSettled: () => queryClient.clear(),
  });
}
