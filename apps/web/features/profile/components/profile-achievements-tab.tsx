import { Card, CardContent } from "@repo/ui/components/card";
import { Trophy } from "lucide-react";

// Placeholder until the backend exposes achievement data. Kept as a real tab
// so the surface matches the intended design.
export function ProfileAchievementsTab() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Trophy className="size-7" />
        </div>
        <div>
          <h3 className="text-lg font-black uppercase tracking-tight text-foreground">
            Achievements
          </h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Badges for scrims played, tournament wins, and milestones are
            coming soon.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
