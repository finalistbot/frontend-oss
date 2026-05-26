"use client";

import { PageBody } from "@/components/layouts/page-body";
import { PageHeader } from "@/components/layouts/page-header";
import { CreatePresetForm } from "@/features/manage-presets/components/create-preset-form";

export default function CreatePresetPage() {
  return (
    <>
      <PageHeader
        title="Create preset"
        description="Recurring template that auto-generates scrims on a daily / weekly cadence."
      />
      <PageBody>
        <CreatePresetForm />
      </PageBody>
    </>
  );
}
