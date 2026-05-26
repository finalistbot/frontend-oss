"use client";

import { useOrgMembers, type OrgRole } from "@repo/api";
import { useAuth } from "@repo/auth";

export interface OrgRoleResult {
  role: OrgRole | null;
  isOwner: boolean;
  isAdmin: boolean; // owner OR admin
  isModerator: boolean; // any role
  isLoading: boolean;
}

// Derive the caller's role in a given org by joining `useAuth()` with
// `useOrgMembers(orgId)`. UI gates (e.g. "show Settings tab" / "show Invite
// button") branch on the booleans this returns.
export function useOrgRole(orgId: number): OrgRoleResult {
  const { user } = useAuth();
  const { data, isLoading } = useOrgMembers(orgId, { enabled: orgId > 0 });

  const member = data?.find((m) => m.user_id === user?.id);
  const role = member?.role ?? null;

  return {
    role,
    isOwner: role === "owner",
    isAdmin: role === "owner" || role === "admin",
    isModerator: role !== null,
    isLoading,
  };
}
