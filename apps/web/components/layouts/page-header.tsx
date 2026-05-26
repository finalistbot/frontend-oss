"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface BackLink {
  href: string;
  label?: string;
}

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  action?: ReactNode;
  back?: BackLink;
}

// Canonical page header for both /play and /manage. Edge-to-edge banner.
export function PageHeader({ title, description, meta, action, back }: PageHeaderProps) {
  return (
    <section className=" border-b border-border bg-card  text-card-foreground  md:px-8 lg:py-10">
      <div className="mx-auto flex  flex-col gap-4">
        {back ? (
          <Link
            href={back.href}
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            {back.label ?? "Back"}
          </Link>
        ) : null}

        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-3xl font-primary uppercase leading-none tracking-tight text-foreground md:text-4xl">
              {title}
            </h1>
            {description ? (
              <p className="max-w-2xl text-sm text-muted-foreground font-secondary md:text-base">
                {description}
              </p>
            ) : null}
            {meta ? (
              <div className="flex flex-wrap items-center gap-2 pt-1">{meta}</div>
            ) : null}
          </div>
          {action ? <div className="flex flex-wrap items-center gap-2">{action}</div> : null}
        </div>
      </div>
    </section>
  );
}
