// Common types shared across modules. Mirror backend `internal/ports/http/common`.

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

// Canonical wire envelope for every list endpoint. `data` is never null —
// empty results come back as `[]`.
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

// Backend ID conventions: catalog uses int32 (Game/Mode/Map IDs), everything
// else int64. Both serialise as JS `number` since 2^53 is plenty for our scale.
export type Int32 = number;
export type Int64 = number;

export type ISODateTime = string; // RFC3339
export type ISODate = string; // YYYY-MM-DD
export type TimeOfDay = string; // HH:MM or HH:MM:SS
