// Canonical paginated envelope. Keep in sync with backend
// `internal/ports/http/common.PaginatedResponse[T]`.

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// Legacy alias — older code imports `PaginationInfo`. Re-export so existing
// consumers keep compiling; prefer `PaginationMeta` going forward.
export type PaginationInfo = PaginationMeta;
