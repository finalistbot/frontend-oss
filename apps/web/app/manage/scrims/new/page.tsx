"use client";

import { PageBody } from "@/components/layouts/page-body";
import { PageHeader } from "@/components/layouts/page-header";
import { CreateScrimForm } from "@/features/manage-scrims/components/create-scrim-form";

export default function CreateScrimPage() {
  return (
    <>
      <PageHeader
        title="Create scrim"
        description="Single scheduled match instance. Use a preset for recurring scrims."
      />
      <PageBody>
        <CreateScrimForm />
      </PageBody>
    </>
  );
}
