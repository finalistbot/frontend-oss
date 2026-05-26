import type { ApiClient } from "../client/client";
import type { PaginatedResponse, PaginationQuery } from "../types/shared";
import type {
  BanPlayerInput,
  BanTeamInput,
  CreateOrgInput,
  InviteMemberInput,
  Organization,
  OrgInvite,
  OrgMember,
  PlayerBan,
  TeamBan,
  UpdateMemberRoleInput,
  UpdateOrgInput,
} from "../types/organizations";

const base = "/api/v1";

export const organizationEndpoints = {
  create: (api: ApiClient, body: CreateOrgInput) =>
    api.post<Organization>(`${base}/organizations`, { body }),

  listMine: (api: ApiClient, query?: PaginationQuery) =>
    api.get<PaginatedResponse<Organization>>(`${base}/organizations/@me`, { query }),

  get: (api: ApiClient, id: number) =>
    api.get<Organization>(`${base}/organizations/${id}`),

  update: (api: ApiClient, id: number, body: UpdateOrgInput) =>
    api.patch<Organization>(`${base}/organizations/${id}`, { body }),

  // 409 with `scrim_refs` body when delete is blocked. Caller handles via ApiError.
  delete: (api: ApiClient, id: number) =>
    api.delete<void>(`${base}/organizations/${id}`),

  // Members.
  listMembers: (api: ApiClient, id: number) =>
    api.get<OrgMember[]>(`${base}/organizations/${id}/members`),

  updateMemberRole: (
    api: ApiClient,
    id: number,
    userId: number,
    body: UpdateMemberRoleInput,
  ) =>
    api.put<OrgMember>(`${base}/organizations/${id}/member/${userId}/role`, { body }),

  removeMember: (api: ApiClient, id: number, userId: number) =>
    api.delete<void>(`${base}/organizations/${id}/member/${userId}`),

  // Invites.
  invite: (api: ApiClient, id: number, body: InviteMemberInput) =>
    api.post<OrgInvite>(`${base}/organizations/${id}/invites`, { body }),

  listOrgInvites: (api: ApiClient, id: number, query?: PaginationQuery) =>
    api.get<PaginatedResponse<OrgInvite>>(`${base}/organizations/${id}/invites`, { query }),

  listMyInvites: (api: ApiClient, query?: PaginationQuery) =>
    api.get<PaginatedResponse<OrgInvite>>(`${base}/organizations/invites/@me`, { query }),

  acceptInvite: (api: ApiClient, inviteId: number) =>
    api.post<OrgMember>(`${base}/organizations/invites/${inviteId}/accept`),

  declineInvite: (api: ApiClient, inviteId: number) =>
    api.post<void>(`${base}/organizations/invites/${inviteId}/decline`),

  cancelInvite: (api: ApiClient, inviteId: number) =>
    api.delete<void>(`${base}/organizations/invites/${inviteId}`),

  // Bans.
  banTeam: (api: ApiClient, id: number, body: BanTeamInput) =>
    api.post<TeamBan>(`${base}/organizations/${id}/bans`, { body }),

  listTeamBans: (api: ApiClient, id: number, query?: PaginationQuery) =>
    api.get<PaginatedResponse<TeamBan>>(`${base}/organizations/${id}/bans`, { query }),

  unbanTeam: (api: ApiClient, id: number, teamId: number) =>
    api.delete<void>(`${base}/organizations/${id}/bans/${teamId}`),

  banPlayer: (api: ApiClient, id: number, body: BanPlayerInput) =>
    api.post<PlayerBan>(`${base}/organizations/${id}/player-bans`, { body }),

  listPlayerBans: (api: ApiClient, id: number, query?: PaginationQuery) =>
    api.get<PaginatedResponse<PlayerBan>>(`${base}/organizations/${id}/player-bans`, { query }),

  unbanPlayer: (api: ApiClient, id: number, userId: number) =>
    api.delete<void>(`${base}/organizations/${id}/player-bans/${userId}`),

  // Cron target.
  expireStaleInvites: (api: ApiClient) =>
    api.post<{ expired: number }>(`${base}/platform/organizations/invites/expire-stale`),
};
