import { CalendarDays } from "lucide-react";
import { EmptyState } from "@/components/layouts/empty-state";
import { PageBody } from "@/components/layouts/page-body";
import { PageHeader } from "@/components/layouts/page-header";

export default function ManageCalendarPage() {
  return (
    <>
      <PageHeader
        title="Calendar"
        description="Schedule view of upcoming scrims and preset cadence."
      />
      <PageBody>
        <EmptyState
          icon={<CalendarDays className="size-10" />}
          title="Calendar view coming soon"
          description="Once scrims are scheduled, they'll appear here on a week / month grid."
        />
      </PageBody>
    </>
  );
}
