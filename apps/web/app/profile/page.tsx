"use client";

import { useState } from "react";
import { useMyRegistrations } from "@repo/api";
import { useAuth } from "@repo/auth";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import { PageHeader } from "@/components/layouts/page-header";
import { ProfileAchievementsTab } from "@/features/profile/components/profile-achievements-tab";
import { ProfileHero } from "@/features/profile/components/profile-hero";
import { ProfileIdentitiesTab } from "@/features/profile/components/profile-identities-tab";
import { ProfileOverviewTab } from "@/features/profile/components/profile-overview-tab";

export default function ProfilePage() {
  const { user } = useAuth();
  const registrations = useMyRegistrations();
  const [tab, setTab] = useState("overview");

  if (!user) {
    return (
      <>
        <PageHeader title="My profile" />
        <p className="text-sm text-muted-foreground">Loading profile...</p>
      </>
    );
  }

  const scrimsPlayed = registrations.data?.length ?? 0;

  return (
    <>
      <PageHeader
        title="My profile"
        description="Your account details and per-game identities. Captains see in-game names on slot lists."
      />

      <ProfileHero user={user} scrimsPlayed={scrimsPlayed} />

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="identities">Identities</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <ProfileOverviewTab
            user={user}
            onManageIdentities={() => setTab("identities")}
          />
        </TabsContent>
        <TabsContent value="identities" className="mt-6">
          <ProfileIdentitiesTab />
        </TabsContent>
        <TabsContent value="achievements" className="mt-6">
          <ProfileAchievementsTab />
        </TabsContent>
      </Tabs>
    </>
  );
}
