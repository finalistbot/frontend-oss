"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../client/provider";
import { registrationEndpoints } from "../endpoints/registrations";
import { queryKeys } from "./query-keys";
import { useRealtime } from "./use-realtime";
import type {
  AddLineupMemberInput,
  AssignSlotInput,
  RegisterTeamInput,
  SwapSlotsInput,
  UpdateLineupMemberInput,
  UpdateSlotInput,
} from "../types/registrations";
import { topics, type ServerEvent } from "../types/realtime";
import type { PaginationQuery } from "../types/shared";

// ----- queries -----

export function useRegisteredTeams(scrimId: number, query?: PaginationQuery, options?: { enabled?: boolean }) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.registrations.teams(scrimId, query?.page, query?.limit),
    queryFn: () => registrationEndpoints.listRegisteredTeams(api, scrimId, query),
    enabled: options?.enabled !== false && scrimId > 0,
  });
}

export function useScrimSlots(scrimId: number, options?: { enabled?: boolean }) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.registrations.slots(scrimId),
    queryFn: () => registrationEndpoints.listSlots(api, scrimId),
    enabled: options?.enabled !== false && scrimId > 0,
  });
}

export function useScrimWaitlist(scrimId: number, options?: { enabled?: boolean }) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.registrations.waitlist(scrimId),
    queryFn: () => registrationEndpoints.listWaitlist(api, scrimId),
    enabled: options?.enabled !== false && scrimId > 0,
  });
}

export function useLineupMembers(registeredTeamId: number, options?: { enabled?: boolean }) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.registrations.members(registeredTeamId),
    queryFn: () => registrationEndpoints.listLineupMembers(api, registeredTeamId),
    enabled: options?.enabled !== false && registeredTeamId > 0,
  });
}

export function useFilterLogs(scrimId: number, query?: PaginationQuery, options?: { enabled?: boolean }) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.registrations.filterLog(scrimId, query?.page, query?.limit),
    queryFn: () => registrationEndpoints.listFilterLogs(api, scrimId, query),
    enabled: options?.enabled !== false && scrimId > 0,
  });
}

// useMyRegistrations powers the "Registered" badge on /play/scrims. One small
// fetch instead of N per-scrim lookups.
export function useMyRegistrations(options?: { enabled?: boolean }) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.registrations.mine,
    queryFn: () => registrationEndpoints.listMyRegistrations(api),
    enabled: options?.enabled !== false,
  });
}

// ----- mutations -----

function invalidateScrimRegistration(queryClient: ReturnType<typeof useQueryClient>, scrimId: number) {
  queryClient.invalidateQueries({ queryKey: ["registrations", "teams", scrimId] });
  queryClient.invalidateQueries({ queryKey: queryKeys.registrations.slots(scrimId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.registrations.waitlist(scrimId) });
  // The caller's own registration list changes whenever a register/unregister
  // succeeds — keep "Registered" badges on /play/scrims fresh.
  queryClient.invalidateQueries({ queryKey: queryKeys.registrations.mine });
}

export function useScrimRegistrationRealtime(
  scrimId: number,
  apiBaseUrl: string,
  options?: { enabled?: boolean; onEvent?: (event: ServerEvent) => void },
) {
  const queryClient = useQueryClient();
  const realtimeTopics = useMemo(
    () => (scrimId > 0 ? [topics.scrim(scrimId)] : []),
    [scrimId],
  );

  return useRealtime({
    apiBaseUrl,
    token: options?.enabled === false || scrimId <= 0 ? null : undefined,
    topics: realtimeTopics,
    onEvent: (event) => {
      if (event.type === "scrim.registration_changed") {
        invalidateScrimRegistration(queryClient, scrimId);
        queryClient.invalidateQueries({
          queryKey: ["registrations", "filter-log", scrimId],
        });
      } else if (event.type === "scrim.status_changed") {
        // A lifecycle transition (e.g. host opened/closed registration).
        // Refetch the scrim so status-derived UI — the status badge, the
        // register/unregister controls — updates live for every viewer, and
        // refresh any scrim lists that surface the status.
        queryClient.invalidateQueries({
          queryKey: queryKeys.scrims.detail(scrimId),
        });
        queryClient.invalidateQueries({ queryKey: ["scrims", "list"] });
      }
      options?.onEvent?.(event);
    },
  });
}

// List-level realtime: subscribe to every visible scrim's topic at once and
// refresh the scrim list whenever any of them changes status or registration.
// Use on grid/card pages (e.g. /play/scrims) where the per-detail hook isn't
// mounted. The id set is keyed by value so a re-rendered array doesn't churn
// the subscriptions.
export function useScrimsListRealtime(
  scrimIds: number[],
  apiBaseUrl: string,
  options?: { enabled?: boolean; onEvent?: (event: ServerEvent) => void },
) {
  const queryClient = useQueryClient();
  const idsKey = scrimIds
    .filter((id) => id > 0)
    .sort((a, b) => a - b)
    .join(",");
  const realtimeTopics = useMemo(
    () => (idsKey ? idsKey.split(",").map((id) => topics.scrim(Number(id))) : []),
    [idsKey],
  );

  return useRealtime({
    apiBaseUrl,
    token: options?.enabled === false || idsKey === "" ? null : undefined,
    topics: realtimeTopics,
    onEvent: (event) => {
      if (
        event.type === "scrim.status_changed" ||
        event.type === "scrim.registration_changed"
      ) {
        queryClient.invalidateQueries({ queryKey: ["scrims", "list"] });
      }
      options?.onEvent?.(event);
    },
  });
}

export function useRegisterTeam(scrimId: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: RegisterTeamInput) =>
      registrationEndpoints.register(api, scrimId, body),
    onSuccess: () => invalidateScrimRegistration(queryClient, scrimId),
  });
}

export function useUnregisterTeam(scrimId: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamId: number) =>
      registrationEndpoints.unregister(api, scrimId, teamId),
    onSuccess: () => invalidateScrimRegistration(queryClient, scrimId),
  });
}

export function useAddLineupMember(registeredTeamId: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AddLineupMemberInput) =>
      registrationEndpoints.addLineupMember(api, registeredTeamId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.registrations.members(registeredTeamId),
      }),
  });
}

export function useUpdateLineupMember(registeredTeamId: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, body }: { userId: number; body: UpdateLineupMemberInput }) =>
      registrationEndpoints.updateLineupMember(api, registeredTeamId, userId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.registrations.members(registeredTeamId),
      }),
  });
}

export function useRemoveLineupMember(registeredTeamId: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) =>
      registrationEndpoints.removeLineupMember(api, registeredTeamId, userId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.registrations.members(registeredTeamId),
      }),
  });
}

// invalidateSlotsAndWaitlist refreshes both lists together — every slot
// mutation moves a team in or out of the waitlist, so the two queries must
// stay in sync.
function invalidateSlotsAndWaitlist(
  queryClient: ReturnType<typeof useQueryClient>,
  scrimId: number,
) {
  queryClient.invalidateQueries({ queryKey: queryKeys.registrations.slots(scrimId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.registrations.waitlist(scrimId) });
}

export function useAssignSlot(scrimId: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AssignSlotInput) =>
      registrationEndpoints.assignSlot(api, scrimId, body),
    onSuccess: () => invalidateSlotsAndWaitlist(queryClient, scrimId),
  });
}

export function useSwapSlots(scrimId: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SwapSlotsInput) =>
      registrationEndpoints.swapSlots(api, scrimId, body),
    onSuccess: () => invalidateSlotsAndWaitlist(queryClient, scrimId),
  });
}

export function useUpdateSlot(scrimId: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slotId, body }: { slotId: number; body: UpdateSlotInput }) =>
      registrationEndpoints.updateSlot(api, slotId, body),
    onSuccess: () => invalidateSlotsAndWaitlist(queryClient, scrimId),
  });
}

export function useClearSlot(scrimId: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slotId: number) => registrationEndpoints.clearSlot(api, slotId),
    onSuccess: () => invalidateSlotsAndWaitlist(queryClient, scrimId),
  });
}

// useResetScrimSlots empties every assigned slot for a scrim. Backend is
// host-only; teams stay registered (they fall back to the waitlist).
export function useResetScrimSlots(scrimId: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => registrationEndpoints.resetSlots(api, scrimId),
    onSuccess: () => invalidateScrimRegistration(queryClient, scrimId),
  });
}

export function useDeleteSlot(scrimId: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slotId: number) => registrationEndpoints.deleteSlot(api, slotId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.registrations.slots(scrimId) }),
  });
}

export function usePromoteFromWaitlist(scrimId: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (registeredTeamId: number) =>
      registrationEndpoints.promoteFromWaitlist(api, scrimId, registeredTeamId),
    onSuccess: () => invalidateScrimRegistration(queryClient, scrimId),
  });
}

export function useDemoteToWaitlist(scrimId: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (registeredTeamId: number) =>
      registrationEndpoints.demoteToWaitlist(api, registeredTeamId),
    onSuccess: () => invalidateScrimRegistration(queryClient, scrimId),
  });
}
