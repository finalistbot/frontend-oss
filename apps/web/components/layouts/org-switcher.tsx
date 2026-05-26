"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Building2,
  Check,
  ChevronDown,
  LayoutGrid,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { useMyOrgs, type Organization } from "@repo/api";
import { useAuth } from "@repo/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { useActiveOrg } from "@/components/layouts/active-org";
import { CreateOrgDialog } from "@/features/manage-organizations/components/create-org-dialog";
import { cn } from "@/lib/utils";

// Org/workspace switcher mounted in the /manage secondary topbar (so it is
// manage-only by construction). It sets the "current organization" that scopes
// the rest of /manage — picking an org filters scrims down to that workspace.
// Selecting drops you on the scrims list so the effect is immediately visible;
// "All organizations" clears the filter back to everything you can host.
export function OrgSwitcher() {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const { user } = useAuth();
  const { data, isLoading } = useMyOrgs({ limit: 50 });
  const { activeOrgId, setActiveOrgId } = useActiveOrg();
  const [createOpen, setCreateOpen] = useState(false);

  // While viewing an org's page, treat that org as the current one so the
  // switcher label and scrim filter stay in sync with what you're looking at.
  const routeMatch = pathname.match(/^\/manage\/organizations\/(\d+)/);
  const routeOrgId = routeMatch ? Number(routeMatch[1]) : null;
  useEffect(() => {
    if (routeOrgId !== null && routeOrgId !== activeOrgId) {
      setActiveOrgId(routeOrgId);
    }
  }, [routeOrgId, activeOrgId, setActiveOrgId]);

  const orgs = data?.data ?? [];
  const active = orgs.find((o) => o.id === activeOrgId) ?? null;

  function select(id: number | null) {
    setActiveOrgId(id);
    // Land on the scrims list so the org-scoped view is visible right away —
    // unless we're already on a scrims page, which re-filters in place.
    if (!pathname.startsWith("/manage/scrims")) {
      router.push("/manage/scrims");
    }
  }

  // No orgs yet → the switcher becomes a "create your first org" entry point.
  if (!isLoading && orgs.length === 0) {
    return (
      <>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex h-8 items-center gap-2 rounded-full border border-dashed border-border bg-muted-background/40 pl-2.5 pr-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground focus-visible:border-ring focus-visible:outline-none"
        >
          <Plus className="size-3.5" />
          <span>Create organization</span>
        </button>
        <CreateOrgDialog open={createOpen} onOpenChange={setCreateOpen} />
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Switch organization"
          className="group inline-flex h-8 max-w-[240px] items-center gap-2 rounded-full border border-border bg-muted-background/60 pl-1.5 pr-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted-background focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
        >
          {active ? (
            <OrgAvatar org={active} size="sm" />
          ) : (
            <span className="grid size-5 shrink-0 place-items-center rounded-md bg-muted-background text-muted-foreground">
              <LayoutGrid className="size-3" />
            </span>
          )}
          <span className="truncate">
            {active
              ? active.name
              : isLoading
                ? "Loading…"
                : "All organizations"}
          </span>
          <ChevronDown className="size-3.5 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" sideOffset={6} className="w-72">
          <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Organizations
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={() => select(null)}
            className={cn(
              "flex cursor-pointer items-center gap-3 py-2",
              activeOrgId === null && "bg-accent/40",
            )}
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-md bg-muted-background text-muted-foreground">
              <LayoutGrid className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                All organizations
                {activeOrgId === null ? (
                  <Check className="size-3.5 shrink-0 text-primary" aria-hidden />
                ) : null}
              </span>
              <span className="block text-xs text-muted-foreground">
                Scrims across every workspace
              </span>
            </span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <div className="max-h-72 overflow-y-auto custom-scrollbar">
            {orgs.map((org) => {
              const isActive = org.id === active?.id;
              const isOwner = user?.id === org.owner_id;
              return (
                <DropdownMenuItem
                  key={org.id}
                  onSelect={() => select(org.id)}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 py-2",
                    isActive && "bg-accent/40",
                  )}
                >
                  <OrgAvatar org={org} size="md" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                      <span className="truncate">{org.name}</span>
                      {isActive ? (
                        <Check
                          className="size-3.5 shrink-0 text-primary"
                          aria-hidden
                        />
                      ) : null}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      /o/{org.slug}
                    </span>
                  </span>
                  {isOwner ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
                      <ShieldCheck className="size-3" />
                      Owner
                    </span>
                  ) : null}
                </DropdownMenuItem>
              );
            })}
          </div>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => router.push("/manage/organizations")}
            className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground"
          >
            <Building2 className="size-4" />
            Manage organizations
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => setCreateOpen(true)}
            className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground"
          >
            <Plus className="size-4" />
            Create organization
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateOrgDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}

function OrgAvatar({
  org,
  size,
}: {
  org: Organization;
  size: "sm" | "md";
}) {
  const dimension = size === "sm" ? "size-5" : "size-8";
  const logo = org.logo_url?.trim() ?? "";

  if (logo.length > 0) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={logo}
        alt=""
        aria-hidden
        className={cn(dimension, "shrink-0 rounded-md object-cover")}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        dimension,
        "grid shrink-0 place-items-center rounded-md bg-primary/10 font-primary font-black uppercase text-primary",
        size === "sm" ? "text-[9px]" : "text-[11px]",
      )}
    >
      {orgInitials(org.name)}
    </span>
  );
}

function orgInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}
