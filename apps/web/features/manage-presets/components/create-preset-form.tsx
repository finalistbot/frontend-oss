"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { isApiError, useCreatePreset, type CreatePresetInput } from "@repo/api";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Switch } from "@repo/ui/components/switch";
import {
  ScopeSelectors,
  type ScopeValue,
} from "@/features/manage-shared/components/scope-selectors";

const WEEKDAYS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 7, label: "Sun" },
];

function getDefaultTimezone() {
  if (typeof Intl === "undefined") return "UTC";
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function mapErrorMessage(code: string) {
  switch (code) {
    case "preset_forbidden":
      return "You don't have permission to create presets in this org.";
    case "validation_error":
      return "Some fields are missing or invalid.";
    default:
      return "Could not create preset. Please try again.";
  }
}

export function CreatePresetForm() {
  const router = useRouter();
  const create = useCreatePreset();

  const [scope, setScope] = useState<ScopeValue>({
    organizationId: null,
    gameId: null,
    gameModeId: null,
  });
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [recurrenceType, setRecurrenceType] = useState<"daily" | "weekly">("weekly");
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([5]); // Fri
  const [scrimStartTime, setScrimStartTime] = useState("18:00");
  const [scrimDurationMinutes, setScrimDurationMinutes] = useState(180);
  const [registrationOpenBeforeMinutes, setRegistrationOpenBeforeMinutes] = useState(360);
  const [registrationCloseBeforeMinutes, setRegistrationCloseBeforeMinutes] = useState(30);
  const [resetTime, setResetTime] = useState("06:00");
  const [timezone, setTimezone] = useState(getDefaultTimezone());
  const [mapRotation, setMapRotation] = useState<"manual" | "random" | "round_robin">(
    "round_robin",
  );
  const [maxSlots, setMaxSlots] = useState(16);
  const [minLineupSize, setMinLineupSize] = useState<number | "">("");
  const [autoSlotlist, setAutoSlotlist] = useState(true);
  const [requireIGN, setRequireIGN] = useState(false);
  const [filterApplyBeforeMinutes, setFilterApplyBeforeMinutes] = useState<number | "">(
    "",
  );
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    !!scope.gameId &&
    !!scope.gameModeId &&
    !!name.trim() &&
    !!scrimStartTime &&
    scrimDurationMinutes > 0 &&
    (recurrenceType === "daily" || recurrenceDays.length > 0);

  function toggleDay(day: number) {
    setRecurrenceDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort(),
    );
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!canSubmit || !scope.gameId || !scope.gameModeId) return;

    const body: CreatePresetInput = {
      name: name.trim(),
      description: description.trim() || undefined,
      game_id: scope.gameId,
      game_mode_id: scope.gameModeId,
      auto_slotlist: autoSlotlist,
      recurrence_type: recurrenceType,
      recurrence_days: recurrenceType === "weekly" ? recurrenceDays : [],
      scrim_start_time: scrimStartTime,
      scrim_duration_minutes: scrimDurationMinutes,
      registration_open_before_minutes: registrationOpenBeforeMinutes,
      registration_close_before_minutes: registrationCloseBeforeMinutes,
      reset_time: resetTime || undefined,
      timezone: timezone || "UTC",
      map_rotation: mapRotation,
      max_slots: maxSlots > 0 ? maxSlots : null,
      min_lineup_size: typeof minLineupSize === "number" ? minLineupSize : null,
      require_ign: requireIGN,
      filter_apply_before_minutes:
        typeof filterApplyBeforeMinutes === "number" ? filterApplyBeforeMinutes : null,
      organization_id: scope.organizationId ?? null,
    };

    create.mutate(body, {
      onSuccess: (preset) => router.push(`/manage/presets/${preset.id}`),
      onError: (err) =>
        setError(mapErrorMessage(isApiError(err) ? err.code : "unknown")),
    });
  }

  return (
    <form className="grid gap-8" onSubmit={handleSubmit}>
      <Section title="Scope" description="Where this preset runs.">
        <ScopeSelectors value={scope} onChange={setScope} />
      </Section>

      <Section title="Basics">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Name" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={255}
              required
            />
          </Field>
          <Field label="Description">
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
        </div>
      </Section>

      <Section title="Cadence" description="When generated scrims should run.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Recurrence" required>
            <Select
              value={recurrenceType}
              onValueChange={(v: "daily" | "weekly") => setRecurrenceType(v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Timezone" required>
            <Input
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="e.g. Asia/Kolkata"
            />
          </Field>
        </div>

        {recurrenceType === "weekly" ? (
          <Field label="Days" required hint="Pick at least one day.">
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((d) => {
                const active = recurrenceDays.includes(d.value);
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => toggleDay(d.value)}
                    aria-pressed={active}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </Field>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Scrim start time" required>
            <Input
              type="time"
              value={scrimStartTime}
              onChange={(e) => setScrimStartTime(e.target.value)}
              required
            />
          </Field>
          <Field label="Scrim duration (minutes)" required>
            <Input
              type="number"
              min={1}
              value={scrimDurationMinutes}
              onChange={(e) =>
                setScrimDurationMinutes(Number.parseInt(e.target.value, 10) || 1)
              }
              required
            />
          </Field>
          <Field label="Registration opens (mins before start)" required>
            <Input
              type="number"
              min={0}
              value={registrationOpenBeforeMinutes}
              onChange={(e) =>
                setRegistrationOpenBeforeMinutes(
                  Number.parseInt(e.target.value, 10) || 0,
                )
              }
              required
            />
          </Field>
          <Field label="Registration closes (mins before start)" required>
            <Input
              type="number"
              min={0}
              value={registrationCloseBeforeMinutes}
              onChange={(e) =>
                setRegistrationCloseBeforeMinutes(
                  Number.parseInt(e.target.value, 10) || 0,
                )
              }
              required
            />
          </Field>
          <Field label="Daily reset time" hint="When the daily window resets.">
            <Input
              type="time"
              value={resetTime}
              onChange={(e) => setResetTime(e.target.value)}
            />
          </Field>
          <Field label="Map rotation" required>
            <Select
              value={mapRotation}
              onValueChange={(v: "manual" | "random" | "round_robin") =>
                setMapRotation(v)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="random">Random</SelectItem>
                <SelectItem value="round_robin">Round-robin</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </Section>

      <Section title="Slot & lineup defaults" description="Applied to each generated scrim.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Max slots" hint="Leave 0 for unlimited.">
            <Input
              type="number"
              min={0}
              value={maxSlots}
              onChange={(e) => setMaxSlots(Number.parseInt(e.target.value, 10) || 0)}
            />
          </Field>
          <Field label="Min lineup size">
            <Input
              type="number"
              min={1}
              value={minLineupSize}
              onChange={(e) => {
                const v = e.target.value;
                setMinLineupSize(v === "" ? "" : Number.parseInt(v, 10));
              }}
            />
          </Field>
          <Field
            label="Filter apply (mins before start)"
            hint="Auto-kick sweep timing."
          >
            <Input
              type="number"
              min={0}
              value={filterApplyBeforeMinutes}
              onChange={(e) => {
                const v = e.target.value;
                setFilterApplyBeforeMinutes(v === "" ? "" : Number.parseInt(v, 10));
              }}
            />
          </Field>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <Toggle
            label="Auto-assign slots"
            checked={autoSlotlist}
            onChange={setAutoSlotlist}
          />
          <Toggle
            label="Require IGN"
            checked={requireIGN}
            onChange={setRequireIGN}
          />
        </div>
      </Section>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={!canSubmit || create.isPending}>
          {create.isPending ? "Creating..." : "Create preset"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-4 rounded-2xl border border-border bg-card p-5 text-card-foreground">
      <header className="space-y-0.5">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label>
        {label}
        {required ? <span className="ml-1 text-destructive">*</span> : null}
      </Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
      <Switch checked={checked} onCheckedChange={onChange} />
      {label}
    </label>
  );
}
