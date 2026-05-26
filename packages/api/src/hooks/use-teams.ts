"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../client/provider";
import { teamEndpoints } from "../endpoints/teams";
import { queryKeys } from "./query-keys";
import { useRealtime } from "./use-realtime";
import { topics, type ServerEvent } from "../types/realtime";
import type {
  CreateInviteInput,
  CreateTeamInput,
  JoinByCodeInput,
  UpdateTeamInput,
} from "../types/teams";
import type { PaginationQuery } from "../types/shared";

// ----- queries -----

export function useMyTeams(query?: PaginationQuery) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.teams.mine(query?.page, query?.limit),
    queryFn: () => teamEndpoints.listMine(api, query),
  });
}

export function useTeam(id: number, options?: { enabled?: boolean }) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.teams.detail(id),
    queryFn: () => teamEndpoints.get(api, id),
    enabled: options?.enabled !== false && id > 0,
  });
}

export function useTeamMembers(id: number, options?: { enabled?: boolean }) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.teams.members(id),
    queryFn: () => teamEndpoints.listMembers(api, id),
    enabled: options?.enabled !== false && id > 0,
  });
}

export function useMyJoinRequests() {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.teams.myRequests,
    queryFn: () => teamEndpoints.listMyRequests(api),
  });
}

export function useIncomingJoinRequests(teamId: number, options?: { enabled?: boolean }) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.teams.incomingRequests(teamId),
    queryFn: () => teamEndpoints.listIncomingRequests(api, teamId),
    enabled: options?.enabled !== false && teamId > 0,
  });
}

export function useTeamInvites(teamId: number, options?: { enabled?: boolean }) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.teams.invites(teamId),
    queryFn: () => teamEndpoints.listInvites(api, teamId),
    enabled: options?.enabled !== false && teamId > 0,
  });
}

export function useTeamInvitePreview(token: string, options?: { enabled?: boolean }) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.teams.invitePreview(token),
    queryFn: () => teamEndpoints.previewInvite(api, token),
    enabled: options?.enabled !== false && Boolean(token),
  });
}

// ----- realtime -----

function invalidateTeam(queryClient: ReturnType<typeof useQueryClient>, teamId: number) {
  queryClient.invalidateQueries({ queryKey: queryKeys.teams.detail(teamId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.teams.members(teamId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.teams.incomingRequests(teamId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.teams.invites(teamId) });
  queryClient.invalidateQueries({ queryKey: ["teams", "mine"] });
  queryClient.invalidateQueries({ queryKey: queryKeys.teams.myRequests });
}

// useTeamRealtime subscribes to the team:<id> topic and invalidates the
// team's queries (detail, members, requests, invites) whenever the backend
// publishes team.member_changed. Pattern mirrors useScrimRegistrationRealtime.
export function useTeamRealtime(
  teamId: number,
  apiBaseUrl: string,
  options?: { enabled?: boolean; onEvent?: (event: ServerEvent) => void },
) {
  const queryClient = useQueryClient();
  const realtimeTopics = useMemo(
    () => (teamId > 0 ? [topics.team(teamId)] : []),
    [teamId],
  );

  return useRealtime({
    apiBaseUrl,
    token: options?.enabled === false || teamId <= 0 ? null : undefined,
    topics: realtimeTopics,
    onEvent: (event) => {
      if (event.type === "team.member_changed") {
        invalidateTeam(queryClient, teamId);
      }
      options?.onEvent?.(event);
    },
  });
}

// ----- mutations -----

export function useCreateTeam() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTeamInput) => teamEndpoints.create(api, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams", "mine"] });
    },
  });
}

export function useUpdateTeam(id: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateTeamInput) => teamEndpoints.update(api, id, body),
    onSuccess: (team) => {
      queryClient.setQueryData(queryKeys.teams.detail(id), team);
      queryClient.invalidateQueries({ queryKey: ["teams", "mine"] });
    },
  });
}

export function useDeleteTeam(id: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => teamEndpoints.delete(api, id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.teams.detail(id) });
      queryClient.invalidateQueries({ queryKey: ["teams", "mine"] });
    },
  });
}

export function useLeaveTeam(id: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => teamEndpoints.leave(api, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.members(id) });
      queryClient.invalidateQueries({ queryKey: ["teams", "mine"] });
    },
  });
}

export function useKickTeamMember(id: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: number) => teamEndpoints.kick(api, id, memberId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.members(id) }),
  });
}

export function useJoinByCode() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: JoinByCodeInput) => teamEndpoints.joinByCode(api, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.myRequests });
    },
  });
}

export function useCancelJoinRequest() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: number) => teamEndpoints.cancelRequest(api, requestId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.myRequests }),
  });
}

export function useAcceptJoinRequest(teamId: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: number) =>
      teamEndpoints.acceptRequest(api, teamId, requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.incomingRequests(teamId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.members(teamId) });
    },
  });
}

export function useDeclineJoinRequest(teamId: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: number) =>
      teamEndpoints.declineRequest(api, teamId, requestId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.incomingRequests(teamId),
      }),
  });
}

export function useCreateTeamInvite(teamId: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateInviteInput) =>
      teamEndpoints.createInvite(api, teamId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.invites(teamId) }),
  });
}

export function useRevokeTeamInvite(teamId: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: number) =>
      teamEndpoints.revokeInvite(api, teamId, inviteId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.invites(teamId) }),
  });
}

export function useRedeemTeamInvite() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => teamEndpoints.redeemInvite(api, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams", "mine"] });
    },
  });
}
