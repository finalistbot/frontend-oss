import type { ApiClient } from "../client/client";
import type { PaginatedResponse, PaginationQuery } from "../types/shared";
import type {
  AcceptRequestResponse,
  CreateInviteInput,
  CreateInviteResponse,
  CreateTeamInput,
  ExpireStaleResponse,
  InvitePreview,
  JoinByCodeInput,
  JoinByCodeResponse,
  RedeemInviteResponse,
  Team,
  TeamInvite,
  TeamJoinRequest,
  TeamMember,
  UpdateTeamInput,
} from "../types/teams";

const base = "/api/v1";

export const teamEndpoints = {
  create: (api: ApiClient, body: CreateTeamInput) =>
    api.post<Team>(`${base}/teams`, { body }),

  listMine: (api: ApiClient, query?: PaginationQuery) =>
    api.get<PaginatedResponse<Team>>(`${base}/teams/@me`, { query }),

  get: (api: ApiClient, id: number) => api.get<Team>(`${base}/teams/${id}`),

  update: (api: ApiClient, id: number, body: UpdateTeamInput) =>
    api.patch<Team>(`${base}/teams/${id}`, { body }),

  delete: (api: ApiClient, id: number) =>
    api.delete<void>(`${base}/teams/${id}`),

  leave: (api: ApiClient, id: number) =>
    api.post<void>(`${base}/teams/${id}/leave`),

  kick: (api: ApiClient, id: number, memberId: number) =>
    api.post<void>(`${base}/teams/${id}/kick/${memberId}`),

  listMembers: (api: ApiClient, id: number) =>
    api.get<TeamMember[]>(`${base}/teams/${id}/members`),

  // Code-based join requests.
  joinByCode: (api: ApiClient, body: JoinByCodeInput) =>
    api.post<JoinByCodeResponse>(`${base}/teams/join`, { body }),

  listMyRequests: (api: ApiClient) =>
    api.get<TeamJoinRequest[]>(`${base}/teams/requests/@me`),

  cancelRequest: (api: ApiClient, requestId: number) =>
    api.delete<void>(`${base}/teams/requests/${requestId}`),

  listIncomingRequests: (api: ApiClient, teamId: number) =>
    api.get<TeamJoinRequest[]>(`${base}/teams/${teamId}/requests`),

  acceptRequest: (api: ApiClient, teamId: number, requestId: number) =>
    api.post<AcceptRequestResponse>(`${base}/teams/${teamId}/requests/${requestId}/accept`),

  declineRequest: (api: ApiClient, teamId: number, requestId: number) =>
    api.post<void>(`${base}/teams/${teamId}/requests/${requestId}/decline`),

  // Captain-issued invite tokens.
  createInvite: (api: ApiClient, teamId: number, body: CreateInviteInput) =>
    api.post<CreateInviteResponse>(`${base}/teams/${teamId}/invites`, { body }),

  listInvites: (api: ApiClient, teamId: number) =>
    api.get<TeamInvite[]>(`${base}/teams/${teamId}/invites`),

  revokeInvite: (api: ApiClient, teamId: number, inviteId: number) =>
    api.delete<TeamInvite>(`${base}/teams/${teamId}/invites/${inviteId}`),

  previewInvite: (api: ApiClient, token: string) =>
    api.get<InvitePreview>(`${base}/teams/join/${token}`),

  redeemInvite: (api: ApiClient, token: string) =>
    api.post<RedeemInviteResponse>(`${base}/teams/join/${token}`),

  // Housekeeping (cron target).
  expireStaleRequests: (api: ApiClient) =>
    api.post<ExpireStaleResponse>(`${base}/platform/teams/requests/expire-stale`),
};
