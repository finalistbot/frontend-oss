import type { ISODateTime, Int32, Int64 } from "./shared";

export type OrgRole = "owner" | "admin" | "moderator";
export type OrgInviteRole = Exclude<OrgRole, "owner">;
export type OrgInviteStatus = "pending" | "accepted" | "declined" | "cancelled" | "expired";

export interface Organization {
  id: Int64;
  owner_id: Int64;
  // Populated by GET /organizations/@me and GET /organizations/:id (LEFT JOIN
  // on users.owner_id). Undefined for mutation responses and when the owner
  // hasn't completed user setup.
  owner_username?: string | null;
  name: string;
  slug: string;
  logo_url?: string;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface OrgMember {
  id: Int64;
  organization_id: Int64;
  user_id: Int64;
  role: OrgRole;
  created_at: ISODateTime;
  // Username joined from the users table by the list endpoint. May be
  // undefined or null until the user has completed setup.
  username?: string | null;
}

export interface OrgInvite {
  id: Int64;
  organization_id: Int64;
  user_id: Int64;
  invited_by: Int64;
  role: OrgInviteRole;
  status: OrgInviteStatus;
  created_at: ISODateTime;
  expires_at: ISODateTime;
  responded_at?: ISODateTime;
  username?: string | null;
}

export interface TeamBan {
  id: Int64;
  organization_id: Int64;
  team_id: Int32;
  reason?: string;
  banned_by?: Int64;
  created_at: ISODateTime;
}

export interface PlayerBan {
  id: Int64;
  organization_id: Int64;
  user_id: Int64;
  reason?: string;
  banned_by: Int64;
  created_at: ISODateTime;
  username?: string | null;
}

// ----- payloads -----

export interface CreateOrgInput {
  name: string;
  slug: string;
  logo_url?: string;
}

export interface UpdateOrgInput {
  name?: string;
  slug?: string;
  logo_url?: string;
}

export interface InviteMemberInput {
  user_id: Int64;
  role: OrgInviteRole;
}

export interface UpdateMemberRoleInput {
  role: OrgInviteRole;
}

export interface BanTeamInput {
  team_id: Int32;
  reason?: string;
}

export interface BanPlayerInput {
  user_id: Int64;
  reason?: string;
}

// 409 body when org delete is refused due to attached scrims.
export interface OrgDeleteBlockedResponse {
  error: string;
  scrim_refs: Int64[];
}
