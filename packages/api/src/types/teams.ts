import type { ISODateTime, Int32, Int64 } from "./shared";

export type JoinType = "member" | "substitute";
export type JoinRequestStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "expired"
  | "cancelled";

export interface Team {
  id: Int32;
  captain_id: Int64;
  name: string;
  team_code: string;
  hidden: boolean;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface TeamMember {
  team_id: Int32;
  participant_id: Int64;
  joined_at: ISODateTime;
  // Username is populated when the row comes from the list endpoint (which
  // joins users). May be undefined or null for users who haven't picked one yet.
  username?: string | null;
}

export interface TeamJoinRequest {
  id: Int64;
  team_id: Int32;
  user_id: Int64;
  join_type: JoinType;
  status: JoinRequestStatus;
  created_at: ISODateTime;
  expires_at: ISODateTime;
  responded_at?: ISODateTime;
  username?: string | null;
}

export interface TeamInvite {
  id: Int64;
  team_id: Int32;
  token: string;
  created_by: Int64;
  join_type: JoinType;
  max_uses?: Int32;
  uses_count: Int32;
  expires_at?: ISODateTime;
  revoked_at?: ISODateTime;
  created_at: ISODateTime;
}

export interface InvitePreview {
  invite: TeamInvite;
  team_id: Int32;
  team_name: string;
  captain_id: Int64;
}

// ----- request/response payloads -----

export interface CreateTeamInput {
  name: string;
}

export interface UpdateTeamInput {
  name?: string;
}

export interface JoinByCodeInput {
  team_code: string;
}

export interface JoinByCodeResponse {
  request: TeamJoinRequest;
  team_id: Int32;
}

export interface AcceptRequestResponse {
  request: TeamJoinRequest;
  member: TeamMember;
}

export interface CreateInviteInput {
  join_type?: JoinType;
  max_uses?: number;
  expires_at?: ISODateTime;
}

export interface CreateInviteResponse {
  invite: TeamInvite;
  url: string;
}

export interface RedeemInviteResponse {
  invite: TeamInvite;
  team_id: Int32;
  member: TeamMember;
}

export interface ExpireStaleResponse {
  expired: number;
}
