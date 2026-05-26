import type { Scrim, Team, TeamMember } from "@repo/api";
import { userLabel } from "@/lib/user-label";

export type LineupBucket = "player" | "substitute" | "out";

export interface RosterMember {
  userId: number;
  label: string;
  subtitle: string;
  isCaptain: boolean;
}

export function buildRosterMembers(
  members: TeamMember[],
  team: Team | undefined,
  user: { id: number; username?: string | null } | null,
): RosterMember[] {
  if (!team) return [];
  return members.map((member) => {
    const isCaptain = member.participant_id === team.captain_id;
    const isCurrentUser = member.participant_id === user?.id;
    return {
      userId: member.participant_id,
      label: userLabel(
        member.participant_id,
        member.username,
        isCurrentUser ? user?.username || null : null,
      ),
      subtitle: `${isCaptain ? "Captain" : "Member"} · #${member.participant_id}`,
      isCaptain,
    };
  });
}

export function scrimStatusLabel(status: Scrim["status"]) {
  switch (status) {
    case "registration_open":
      return "Registration open";
    case "registration_closed":
      return "Registration closed";
    default:
      return status.replace(/_/g, " ");
  }
}
