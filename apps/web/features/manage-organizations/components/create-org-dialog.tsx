"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isApiError, useCreateOrg } from "@repo/api";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";

interface CreateOrgDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Slugify on the fly so users don't have to manually convert their org name to
// a URL-safe form. Backend still validates server-side.
function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_ ]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function mapErrorMessage(code: string) {
  switch (code) {
    case "slug_taken":
      return "That slug is already taken — try another.";
    case "invalid_slug":
      return "Slug must be lowercase letters, numbers, or hyphens.";
    case "validation_error":
      return "Check the fields and try again.";
    default:
      return "Could not create organization. Please try again.";
  }
}

export function CreateOrgDialog({ open, onOpenChange }: CreateOrgDialogProps) {
  const router = useRouter();
  const createOrg = useCreateOrg();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [slugDirty, setSlugDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-derive slug from name unless the user has manually edited slug.
  useEffect(() => {
    if (!slugDirty) setSlug(slugify(name));
  }, [name, slugDirty]);

  // Reset form whenever the dialog reopens.
  useEffect(() => {
    if (open) {
      setName("");
      setSlug("");
      setLogoUrl("");
      setSlugDirty(false);
      setError(null);
    }
  }, [open]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    createOrg.mutate(
      {
        name: name.trim(),
        slug: slug.trim(),
        logo_url: logoUrl.trim() || undefined,
      },
      {
        onSuccess: (org) => {
          onOpenChange(false);
          router.push(`/manage/organizations/${org.id}`);
        },
        onError: (err) => {
          setError(mapErrorMessage(isApiError(err) ? err.code : "unknown"));
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Create organization</DialogTitle>
          <DialogDescription>
            Organizations own scrims, presets, and ban lists. You become the owner.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="org-name">Name</Label>
            <Input
              id="org-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ACME Esports"
              required
              minLength={1}
              maxLength={100}
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="org-slug">Slug</Label>
            <Input
              id="org-slug"
              value={slug}
              onChange={(e) => {
                setSlugDirty(true);
                setSlug(e.target.value);
              }}
              placeholder="acme"
              required
              minLength={1}
              maxLength={100}
              pattern="[a-z0-9-]+"
            />
            <p className="text-xs text-muted-foreground">
              Lowercase letters, numbers, hyphens. Used in URLs.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="org-logo">Logo URL (optional)</Label>
            <Input
              id="org-logo"
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://cdn.example.com/logo.png"
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createOrg.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createOrg.isPending}>
              {createOrg.isPending ? "Creating..." : "Create organization"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
