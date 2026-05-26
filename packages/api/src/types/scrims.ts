import type { ISODateTime, Int32, Int64, TimeOfDay } from "./shared";

export type ScrimVisibility = "public" | "private";
export type ScrimStatus =
  | "draft"
  | "upcoming"
  | "registration_open"
  | "registration_closed"
  | "ongoing"
  | "completed"
  | "cancelled";

export type RecurrenceType = "daily" | "weekly";
export type MapRotation = "manual" | "random" | "round_robin";
export type PresetStatus = "active" | "paused" | "cancelled";
export type MatchStatus = "pending" | "in_progress" | "completed";

export interface Scrim {
  id: Int64;
  public_id: string;
  name: string;
  description?: string;
  // Optional S3 URL of the organizer-uploaded cover image. Empty/absent
  // when none was picked; UI substitutes the Finalist logo.
  thumbnail_url?: string;
  status: ScrimStatus;
  visibility: ScrimVisibility;
  invite_code?: string;
  registration_open_at: ISODateTime;
  registration_close_at: ISODateTime;
  starts_at: ISODateTime;
  ends_at: ISODateTime;
  auto_slotlist: boolean;
  max_substitutes_per_team: Int32;
  max_slots?: Int32;
  min_lineup_size?: Int32;
  require_ign: boolean;
  // When true, the slot grid is broadcast live during registration. When
  // false, non-organizers don't see slots until registration closes.
  live_slots_visible: boolean;
  filter_apply_before_minutes?: Int32;
  filters_applied_at?: ISODateTime;
  game_id: Int32;
  game_mode_id?: Int32;
  preset_id?: Int64;
  created_by: Int64;
  organization_id?: Int64;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface Preset {
  id: Int64;
  name: string;
  description?: string;
  game_id: Int32;
  game_mode_id: Int32;
  auto_slotlist: boolean;
  recurrence_type: RecurrenceType;
  recurrence_days: Int32[];
  scrim_start_time: TimeOfDay;
  scrim_duration_minutes: Int32;
  registration_open_before_minutes: Int32;
  registration_close_before_minutes: Int32;
  reset_time: TimeOfDay;
  timezone: string;
  map_rotation: MapRotation;
  status: PresetStatus;
  max_slots?: Int32;
  min_lineup_size?: Int32;
  require_ign: boolean;
  filter_apply_before_minutes?: Int32;
  organization_id?: Int64;
  created_by: Int64;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface PresetMap {
  id: Int64;
  preset_id: Int64;
  game_map_id: Int32;
  sort_order: Int32;
  map_name: string;
  map_slug: string;
  map_image_url?: string;
}

export interface Match {
  id: Int64;
  scrim_id: Int64;
  game_map_id?: Int32;
  status: MatchStatus;
  started_at?: ISODateTime;
  ended_at?: ISODateTime;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

// ----- payloads -----

export interface CreateScrimInput {
  name: string;
  description?: string;
  // S3 URL from POST /upload/image. Optional.
  thumbnail_url?: string;
  visibility: ScrimVisibility;
  invite_code?: string;
  registration_open_at: ISODateTime;
  registration_close_at: ISODateTime;
  starts_at: ISODateTime;
  ends_at: ISODateTime;
  auto_slotlist: boolean;
  max_substitutes_per_team: number;
  max_slots?: number | null;
  min_lineup_size?: number | null;
  require_ign: boolean;
  // Optional on create; omission tells the backend to use its default (true).
  live_slots_visible?: boolean;
  filter_apply_before_minutes?: number | null;
  game_id: number;
  game_mode_id?: number | null;
  preset_id?: number | null;
  organization_id?: number | null;
}

export interface UpdateScrimInput {
  name?: string;
  description?: string;
  thumbnail_url?: string;
  registration_open_at?: ISODateTime;
  registration_close_at?: ISODateTime;
  starts_at?: ISODateTime;
  ends_at?: ISODateTime;
  auto_slotlist?: boolean;
  max_substitutes_per_team?: number;
  max_slots?: number | null;
  min_lineup_size?: number | null;
  require_ign?: boolean;
  live_slots_visible?: boolean;
  filter_apply_before_minutes?: number | null;
}

export interface ListScrimsQuery {
  page?: number;
  limit?: number;
  visibility?: ScrimVisibility;
  status?: ScrimStatus;
  game_id?: number;
  organization_id?: number;
  created_by?: number;
}

export interface CreatePresetInput {
  name: string;
  description?: string;
  game_id: number;
  game_mode_id: number;
  auto_slotlist: boolean;
  recurrence_type: RecurrenceType;
  recurrence_days?: number[];
  scrim_start_time: TimeOfDay;
  scrim_duration_minutes: number;
  registration_open_before_minutes: number;
  registration_close_before_minutes: number;
  reset_time?: TimeOfDay;
  timezone?: string;
  map_rotation: MapRotation;
  max_slots?: number | null;
  min_lineup_size?: number | null;
  require_ign: boolean;
  filter_apply_before_minutes?: number | null;
  organization_id?: number | null;
}

export interface UpdatePresetInput {
  name?: string;
  description?: string;
  auto_slotlist?: boolean;
  recurrence_type?: RecurrenceType;
  recurrence_days?: number[];
  scrim_start_time?: TimeOfDay;
  scrim_duration_minutes?: number;
  registration_open_before_minutes?: number;
  registration_close_before_minutes?: number;
  reset_time?: TimeOfDay;
  timezone?: string;
  map_rotation?: MapRotation;
  max_slots?: number | null;
  min_lineup_size?: number | null;
  require_ign?: boolean;
  filter_apply_before_minutes?: number | null;
}

export interface UpdatePresetStatusInput {
  status: PresetStatus;
}

export interface UpdatePresetStatusResponse {
  preset: Preset;
  cancelled_scrims: number;
}

export interface ListPresetsQuery {
  page?: number;
  limit?: number;
  status?: PresetStatus;
  organization_id?: number;
  created_by?: number;
}

export interface PresetMapInput {
  game_map_id: number;
  sort_order?: number;
}

export interface CreateMatchInput {
  scrim_id: number;
  game_map_id?: number | null;
}

export interface UpdateMatchInput {
  game_map_id?: number | null;
}
