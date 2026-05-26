"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  isApiError,
  useDeleteOrg,
  useUpdateOrg,
  type Organization,
} from "@repo/api";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";

interface OrgSettingsTabProps {
  org: Organization;
  isOwner: boolean;
}

export function OrgSettingsTab({ org, isOwner }: OrgSettingsTabProps) {
  const router = useRouter();
  const update = useUpdateOrg(org.id);
  const remove = useDeleteOrg(org.id);
  const [name, setName] = useState(org.name);
  const [slug, setSlug] = useState(org.slug);
  const [logoUrl, setLogoUrl] = useState(org.logo_url ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState("");

  // Reset local form state when the org refreshes from cache.
  useEffect(() => {
    setName(org.name);
    setSlug(org.slug);
    setLogoUrl(org.logo_url ?? "");
  }, [org]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    update.mutate(
      { name, slug, logo_url: logoUrl || undefined },
      {
        onSuccess: () => setSuccess("Saved."),
        onError: (err) =>
          setError(isApiError(err) ? err.message : "Could not save settings."),
      },
    );
  }

  function handleDelete() {
    setError(null);
    remove.mutate(undefined, {
      onSuccess: () => router.push("/manage/organizations"),
      onError: (err) => {
        if (isApiError(err) && err.code === "org_has_scrims") {
          setError("This org has scrims attached and can't be deleted.");
        } else {
          setError(isApiError(err) ? err.message : "Failed to delete.");
        }
      },
    });
  }

  return (
    <div className="space-y-8">
      <form className="grid gap-4 max-w-xl" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="settings-name">Name</Label>
          <Input
            id="settings-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isOwner}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="settings-slug">Slug</Label>
          <Input
            id="settings-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            pattern="[a-z0-9-]+"
            disabled={!isOwner}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="settings-logo">Logo URL</Label>
          <Input
            id="settings-logo"
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            disabled={!isOwner}
          />
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-500">{success}</p> : null}

        <div>
          <Button type="submit" disabled={!isOwner || update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          {!isOwner ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Only the owner can edit organization settings.
            </p>
          ) : null}
        </div>
      </form>

      {isOwner ? (
        <section className="max-w-xl rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
          <h3 className="text-base font-semibold text-destructive">Danger zone</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Deleting an organization is permanent. Scrims attached to this org will
            block deletion.
          </p>
          <div className="mt-4 grid gap-2">
            <Label htmlFor="confirm-delete" className="text-xs uppercase tracking-wide">
              Type <span className="font-mono text-foreground">{org.slug}</span> to confirm
            </Label>
            <Input
              id="confirm-delete"
              value={confirmDelete}
              onChange={(e) => setConfirmDelete(e.target.value)}
              placeholder={org.slug}
            />
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={confirmDelete !== org.slug || remove.isPending}
            >
              {remove.isPending ? "Deleting..." : "Delete organization"}
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
