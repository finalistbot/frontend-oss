"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  isApiError,
  useCreateScrim,
  useUploadImage,
  type CreateScrimInput,
} from "@repo/api";
import { Button } from "@repo/ui/components/button";
import { ImageIcon, Trash2, Upload } from "lucide-react";
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
import { Textarea } from "@repo/ui/components/textarea";
import {
  ScopeSelectors,
  type ScopeValue,
} from "@/features/manage-shared/components/scope-selectors";

function localToISO(value: string) {
  if (!value) return "";
  // <input type="datetime-local"> returns "YYYY-MM-DDTHH:mm" in local time.
  // new Date(...).toISOString() converts to UTC RFC3339.
  return new Date(value).toISOString();
}

function mapErrorMessage(code: string) {
  switch (code) {
    case "invalid_time_window":
      return "Window must satisfy: register-open < register-close <= starts-at < ends-at.";
    case "invite_code_collision":
      return "Invite code already used. Pick another.";
    case "scrim_forbidden":
      return "You don't have permission to create scrims in this org.";
    case "validation_error":
      return "Some fields are missing or invalid.";
    default:
      return "Could not create scrim. Please try again.";
  }
}

export function CreateScrimForm() {
  const router = useRouter();
  const create = useCreateScrim();
  const uploadImage = useUploadImage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [scope, setScope] = useState<ScopeValue>({
    organizationId: null,
    gameId: null,
    gameModeId: null,
  });
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [inviteCode, setInviteCode] = useState("");
  const [registrationOpenAt, setRegistrationOpenAt] = useState("");
  const [registrationCloseAt, setRegistrationCloseAt] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [autoSlotlist, setAutoSlotlist] = useState(true);
  const [maxSubstitutes, setMaxSubstitutes] = useState(1);
  const [maxSlots, setMaxSlots] = useState(16);
  const [minLineupSize, setMinLineupSize] = useState<number | "">("");
  const [requireIGN, setRequireIGN] = useState(false);
  const [liveSlotsVisible, setLiveSlotsVisible] = useState(true);
  const [filterApplyBeforeMinutes, setFilterApplyBeforeMinutes] = useState<
    number | ""
  >("");
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    !!scope.gameId &&
    !!name.trim() &&
    !!registrationOpenAt &&
    !!registrationCloseAt &&
    !!startsAt &&
    !!endsAt;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!canSubmit || !scope.gameId) return;

    const body: CreateScrimInput = {
      name: name.trim(),
      description: description.trim() || undefined,
      thumbnail_url: thumbnailUrl || undefined,
      visibility,
      invite_code: inviteCode.trim() || undefined,
      registration_open_at: localToISO(registrationOpenAt),
      registration_close_at: localToISO(registrationCloseAt),
      starts_at: localToISO(startsAt),
      ends_at: localToISO(endsAt),
      auto_slotlist: autoSlotlist,
      max_substitutes_per_team: maxSubstitutes,
      max_slots: maxSlots > 0 ? maxSlots : null,
      min_lineup_size: typeof minLineupSize === "number" ? minLineupSize : null,
      require_ign: requireIGN,
      live_slots_visible: liveSlotsVisible,
      filter_apply_before_minutes:
        typeof filterApplyBeforeMinutes === "number"
          ? filterApplyBeforeMinutes
          : null,
      game_id: scope.gameId,
      game_mode_id: scope.gameModeId ?? null,
      preset_id: null,
      organization_id: scope.organizationId ?? null,
    };

    create.mutate(body, {
      onSuccess: (scrim) => router.push(`/manage/scrims/${scrim.id}`),
      onError: (err) =>
        setError(mapErrorMessage(isApiError(err) ? err.code : "unknown")),
    });
  }

  async function handleThumbnailPick(file: File | undefined) {
    if (!file) return;
    setThumbnailError(null);
    // 10 MiB matches the backend MaxBytesReader cap.
    if (file.size > 10 * 1024 * 1024) {
      setThumbnailError("Image is too large (max 10MB).");
      return;
    }
    try {
      const res = await uploadImage.mutateAsync({ file, filename: file.name });
      setThumbnailUrl(res.url);
    } catch (err) {
      setThumbnailError(
        isApiError(err) ? err.message : "Could not upload image.",
      );
    }
  }

  return (
    <form className="grid gap-8" onSubmit={handleSubmit}>
      <Section title="Scope" description="Where this scrim runs.">
        <ScopeSelectors value={scope} onChange={setScope} requireMode={false} />
      </Section>

      <Section title="Basics" description="Identity + visibility.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Name" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={255}
              required
            />
          </Field>
          <Field label="Visibility" required>
            <Select
              value={visibility}
              onValueChange={(v: "public" | "private") => setVisibility(v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private (invite-only)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <Field label="Description">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </Field>
        {visibility === "private" ? (
          <Field
            label="Invite code"
            hint="Optional unique code; share-link based on /scrims/invite/<code>"
          >
            <Input
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              maxLength={32}
            />
          </Field>
        ) : null}
        <Field
          label="Cover image"
          hint="Optional. PNG/JPG/WebP/GIF, up to 10MB. Shown on the scrim card; falls back to the Finalist logo when empty."
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-lg border border-dashed border-border bg-muted-background text-muted-foreground">
              {thumbnailUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={thumbnailUrl}
                  alt="Scrim cover preview"
                  className="size-full object-cover"
                />
              ) : (
                <ImageIcon className="size-7" />
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  handleThumbnailPick(e.target.files?.[0]);
                  // Allow picking the same file again after error/cancel.
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploadImage.isPending}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="size-4" />
                {uploadImage.isPending
                  ? "Uploading..."
                  : thumbnailUrl
                    ? "Replace"
                    : "Upload"}
              </Button>
              {thumbnailUrl ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setThumbnailUrl("")}
                >
                  <Trash2 className="size-4" />
                  Remove
                </Button>
              ) : null}
            </div>
          </div>
          {thumbnailError ? (
            <p className="text-xs text-destructive">{thumbnailError}</p>
          ) : null}
        </Field>
      </Section>

      <Section title="Schedule" description="All times in your local timezone.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Registration opens" required>
            <Input
              type="datetime-local"
              value={registrationOpenAt}
              onChange={(e) => setRegistrationOpenAt(e.target.value)}
              required
            />
          </Field>
          <Field label="Registration closes" required>
            <Input
              type="datetime-local"
              value={registrationCloseAt}
              onChange={(e) => setRegistrationCloseAt(e.target.value)}
              required
            />
          </Field>
          <Field label="Starts" required>
            <Input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              required
            />
          </Field>
          <Field label="Ends" required>
            <Input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              required
            />
          </Field>
        </div>
      </Section>

      <Section title="Lineup & slots" description="Roster + slot rules.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Max slots" hint="Leave 0 for unlimited.">
            <Input
              type="number"
              min={0}
              value={maxSlots}
              onChange={(e) => setMaxSlots(Number.parseInt(e.target.value, 10) || 0)}
            />
          </Field>
          <Field label="Max substitutes per team">
            <Input
              type="number"
              min={0}
              value={maxSubstitutes}
              onChange={(e) =>
                setMaxSubstitutes(Number.parseInt(e.target.value, 10) || 0)
              }
            />
          </Field>
          <Field label="Min lineup size" hint="Optional; pre-match filter.">
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
            hint="When the auto-kick sweep runs."
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
          <Toggle
            label="Show slots live during registration"
            checked={liveSlotsVisible}
            onChange={setLiveSlotsVisible}
          />
        </div>
      </Section>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={!canSubmit || create.isPending}>
          {create.isPending ? "Creating..." : "Create scrim"}
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
