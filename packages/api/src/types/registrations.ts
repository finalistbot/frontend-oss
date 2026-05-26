import type { ISODateTime, Int32, Int64 } from "./shared";

export type LineupRole = "member" | "captain" | "substitute";

export interface RegisteredTeam {
  id: Int64;
  scrim_id: Int64;
  team_id: Int64;
  name: string;
  ingame_name: string;
  team_captain: Int64;
  registered_at: ISODateTime;
  created_at: ISODateTime;
}

export interface Slot {
  id: Int64;
  scrim_id: Int64;
  slot_number: Int32;
  registered_team_id?: Int64;
  team_name?: string;
  ingame_name?: string;
  team_id?: Int64;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface RegisteredMember {
  id: Int64;
  registered_team_id: Int64;
  participant_id: Int64;
  ingame_name: string;
  role: LineupRole;
  position: Int32;
  created_at: ISODateTime;
  updated_at: ISODateTime;
  // Username joined in from the users table by the list endpoint; may be
  // undefined or null until the player has completed setup.
  username?: string | null;
}

export interface LineupMemberInput {
  user_id: Int64;
  role?: LineupRole;
  ingame_name?: string;
}

export interface RegisterTeamInput {
  team_id: Int64;
  ingame_name: string;
  lineup: LineupMemberInput[];
}

export interface RegisterTeamResponse {
  team: RegisteredTeam;
  slot?: Slot;
}

export interface AddLineupMemberInput {
  user_id: Int64;
  role?: LineupRole;
  ingame_name?: string;
}

export interface UpdateLineupMemberInput {
  role?: LineupRole;
  ingame_name?: string;
  position?: number;
}

export interface AssignSlotInput {
  slot_number: number;
  registered_team_id?: Int64 | null;
}

export interface UpdateSlotInput {
  registered_team_id?: Int64 | null;
}

export interface SwapSlotsInput {
  slot_a_id: Int64;
  slot_b_id: Int64;
}

// Backend currently returns the raw filter-log row shape (untyped on the Go
// side — paginated). Typed loosely for now; tighten when backend exposes a DTO.
export type FilterLogEntry = Record<string, unknown>;

// Compact projection returned by GET /registration/me/registrations. One row
// per scrim the caller is currently registered in (either as captain or as a
// team member).
export interface UserRegistration {
  id: Int64;
  scrim_id: Int64;
  team_id: Int64;
  ingame_name: string;
  team_captain: Int64;
  registered_at: ISODateTime;
}
