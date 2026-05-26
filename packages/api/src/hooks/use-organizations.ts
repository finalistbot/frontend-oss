"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../client/provider";
import { organizationEndpoints } from "../endpoints/organizations";
import { queryKeys } from "./query-keys";
import type {
  BanPlayerInput,
  BanTeamInput,
  CreateOrgInput,
  InviteMemberInput,
  UpdateMemberRoleInput,
  UpdateOrgInput,
} from "../types/organizations";
import type { PaginationQuery } from "../types/shared";

// ----- queries -----

export function useMyOrgs(query?: PaginationQuery) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.organizations.mine(query?.page, query?.limit),
    queryFn: () => organizationEndpoints.listMine(api, query),
  });
}

export function useOrg(id: number, options?: { enabled?: boolean }) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.organizations.detail(id),
    queryFn: () => organizationEndpoints.get(api, id),
    enabled: options?.enabled !== false && id > 0,
  });
}

export function useOrgMembers(id: number, options?: { enabled?: boolean }) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.organizations.members(id),
    queryFn: () => organizationEndpoints.listMembers(api, id),
    enabled: options?.enabled !== false && id > 0,
  });
}

export function useOrgInvites(id: number, query?: PaginationQuery, options?: { enabled?: boolean }) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.organizations.invites(id, query?.page, query?.limit),
    queryFn: () => organizationEndpoints.listOrgInvites(api, id, query),
    enabled: options?.enabled !== false && id > 0,
  });
}

export function useMyOrgInvites(query?: PaginationQuery) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.organizations.myInvites(query?.page, query?.limit),
    queryFn: () => organizationEndpoints.listMyInvites(api, query),
  });
}

export function useOrgTeamBans(id: number, query?: PaginationQuery, options?: { enabled?: boolean }) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.organizations.teamBans(id, query?.page, query?.limit),
    queryFn: () => organizationEndpoints.listTeamBans(api, id, query),
    enabled: options?.enabled !== false && id > 0,
  });
}

export function useOrgPlayerBans(id: number, query?: PaginationQuery, options?: { enabled?: boolean }) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.organizations.playerBans(id, query?.page, query?.limit),
    queryFn: () => organizationEndpoints.listPlayerBans(api, id, query),
    enabled: options?.enabled !== false && id > 0,
  });
}

// ----- mutations -----

export function useCreateOrg() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateOrgInput) => organizationEndpoints.create(api, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["organizations", "mine"] }),
  });
}

export function useUpdateOrg(id: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateOrgInput) => organizationEndpoints.update(api, id, body),
    onSuccess: (org) => {
      queryClient.setQueryData(queryKeys.organizations.detail(id), org);
      queryClient.invalidateQueries({ queryKey: ["organizations", "mine"] });
    },
  });
}

export function useDeleteOrg(id: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => organizationEndpoints.delete(api, id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.organizations.detail(id) });
      queryClient.invalidateQueries({ queryKey: ["organizations", "mine"] });
    },
  });
}

export function useUpdateOrgMemberRole(id: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, body }: { userId: number; body: UpdateMemberRoleInput }) =>
      organizationEndpoints.updateMemberRole(api, id, userId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.members(id) }),
  });
}

export function useRemoveOrgMember(id: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) =>
      organizationEndpoints.removeMember(api, id, userId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.members(id) }),
  });
}

export function useInviteOrgMember(id: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: InviteMemberInput) =>
      organizationEndpoints.invite(api, id, body),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["organizations", "invites", id],
      }),
  });
}

export function useAcceptOrgInvite() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: number) =>
      organizationEndpoints.acceptInvite(api, inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations", "my-invites"] });
      queryClient.invalidateQueries({ queryKey: ["organizations", "mine"] });
    },
  });
}

export function useDeclineOrgInvite() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: number) =>
      organizationEndpoints.declineInvite(api, inviteId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["organizations", "my-invites"] }),
  });
}

export function useCancelOrgInvite() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: number) =>
      organizationEndpoints.cancelInvite(api, inviteId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["organizations", "invites"] }),
  });
}

export function useBanOrgTeam(id: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: BanTeamInput) => organizationEndpoints.banTeam(api, id, body),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["organizations", "team-bans", id],
      }),
  });
}

export function useUnbanOrgTeam(id: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamId: number) =>
      organizationEndpoints.unbanTeam(api, id, teamId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["organizations", "team-bans", id],
      }),
  });
}

export function useBanOrgPlayer(id: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: BanPlayerInput) =>
      organizationEndpoints.banPlayer(api, id, body),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["organizations", "player-bans", id],
      }),
  });
}

export function useUnbanOrgPlayer(id: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) =>
      organizationEndpoints.unbanPlayer(api, id, userId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["organizations", "player-bans", id],
      }),
  });
}
