import { Badge } from "@repo/ui/components/badge";
import type { Scrim } from "@repo/api";
import { scrimStatusLabel } from "../lib/scrim-helpers";

export function ScrimStatusBadge({ status }: { status: Scrim["status"] }) {
  if (status === "registration_open") return <Badge>Registration open</Badge>;
  if (status === "registration_closed")
    return <Badge variant="secondary">Registration closed</Badge>;
  if (status === "upcoming") return <Badge variant="secondary">Upcoming</Badge>;
  if (status === "ongoing") return <Badge variant="secondary">Ongoing</Badge>;
  if (status === "cancelled") return <Badge variant="destructive">Cancelled</Badge>;
  if (status === "completed") return <Badge variant="outline">Completed</Badge>;
  return <Badge variant="outline">{scrimStatusLabel(status)}</Badge>;
}
