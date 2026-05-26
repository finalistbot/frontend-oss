import type { ApiClient } from "../client/client";
import type { PaginatedResponse, PaginationQuery } from "../types/shared";
import type {
  AddLineupMemberInput,
  AssignSlotInput,
  FilterLogEntry,
  RegisterTeamInput,
  RegisterTeamResponse,
  RegisteredMember,
  RegisteredTeam,
  Slot,
  SwapSlotsInput,
  UpdateLineupMemberInput,
  UpdateSlotInput,
  UserRegistration,
} from "../types/registrations";

const base = "/api/v1";

export const registrationEndpoints = {
  register: (api: ApiClient, scrimId: number, body: RegisterTeamInput) =>
    api.post<RegisterTeamResponse>(`${base}/registration/${scrimId}/register`, {
      body,
    }),

  unregister: (api: ApiClient, scrimId: number, teamId: number) =>
    api.delete<void>(`${base}/registration/${scrimId}/register/${teamId}`),

  listRegisteredTeams: (api: ApiClient, scrimId: number, query?: PaginationQuery) =>
    api.get<PaginatedResponse<RegisteredTeam>>(
      `${base}/registration/${scrimId}/teams`,
      { query },
    ),

  // Lineup edits.
  listLineupMembers: (api: ApiClient, registeredTeamId: number) =>
    api.get<RegisteredMember[]>(
      `${base}/registration/teams/${registeredTeamId}/members`,
    ),

  addLineupMember: (
    api: ApiClient,
    registeredTeamId: number,
    body: AddLineupMemberInput,
  ) =>
    api.post<RegisteredMember>(
      `${base}/registration/teams/${registeredTeamId}/members`,
      { body },
    ),

  updateLineupMember: (
    api: ApiClient,
    registeredTeamId: number,
    userId: number,
    body: UpdateLineupMemberInput,
  ) =>
    api.patch<RegisteredMember>(
      `${base}/registration/teams/${registeredTeamId}/members/${userId}`,
      { body },
    ),

  removeLineupMember: (
    api: ApiClient,
    registeredTeamId: number,
    userId: number,
  ) =>
    api.delete<void>(
      `${base}/registration/teams/${registeredTeamId}/members/${userId}`,
    ),

  // Slots.
  listSlots: (api: ApiClient, scrimId: number) =>
    api.get<Slot[]>(`${base}/registration/${scrimId}/slots`),

  assignSlot: (api: ApiClient, scrimId: number, body: AssignSlotInput) =>
    api.post<Slot>(`${base}/registration/${scrimId}/slots`, { body }),

  swapSlots: (api: ApiClient, scrimId: number, body: SwapSlotsInput) =>
    api.post<void>(`${base}/registration/${scrimId}/slots/swap`, { body }),

  updateSlot: (api: ApiClient, slotId: number, body: UpdateSlotInput) =>
    api.put<Slot>(`${base}/registration/slots/${slotId}`, { body }),

  clearSlot: (api: ApiClient, slotId: number) =>
    api.post<Slot>(`${base}/registration/slots/${slotId}/clear`),

  deleteSlot: (api: ApiClient, slotId: number) =>
    api.delete<void>(`${base}/registration/slots/${slotId}`),

  // Waitlist.
  listWaitlist: (api: ApiClient, scrimId: number) =>
    api.get<RegisteredTeam[]>(`${base}/registration/${scrimId}/waitlist`),

  promoteFromWaitlist: (api: ApiClient, scrimId: number, registeredTeamId: number) =>
    api.post<Slot>(
      `${base}/registration/${scrimId}/waitlist/${registeredTeamId}/promote`,
    ),

  demoteToWaitlist: (api: ApiClient, registeredTeamId: number) =>
    api.post<Slot>(`${base}/registration/teams/${registeredTeamId}/demote`),

  listFilterLogs: (api: ApiClient, scrimId: number, query?: PaginationQuery) =>
    api.get<FilterLogEntry[]>(`${base}/registration/${scrimId}/filter-log`, {
      query,
    }),

  listMyRegistrations: (api: ApiClient) =>
    api.get<UserRegistration[]>(`${base}/registration/me/registrations`),

  resetSlots: (api: ApiClient, scrimId: number) =>
    api.post<{ cleared: number }>(`${base}/registration/${scrimId}/slots/reset`),
};
