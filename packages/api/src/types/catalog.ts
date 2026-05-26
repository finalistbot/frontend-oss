import type { ISODate, ISODateTime, Int32, Int64 } from "./shared";

export type Platform = "pc" | "mobile" | "console" | "cross_platform";

export interface Game {
  id: Int32;
  name: string;
  slug: string;
  logo_url?: string;
  banner_url?: string;
  platforms: Platform[];
  publisher?: string;
  release_date?: ISODateTime;
  ingame_name_regex?: string;
  active: boolean;
  created_by?: Int64;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface GameMode {
  id: Int32;
  game_id: Int32;
  name: string;
  slug: string;
  team_size?: Int32;
  max_teams?: Int32;
  description?: string;
  active: boolean;
  created_by?: Int64;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface GameMap {
  id: Int32;
  game_id: Int32;
  name: string;
  slug: string;
  image_url?: string;
  active: boolean;
  created_by?: Int64;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface ListGamesQuery {
  page?: number;
  limit?: number;
  active?: boolean;
  platform?: Platform;
}

export interface CreateGameInput {
  name: string;
  slug: string;
  logo_url?: string;
  banner_url?: string;
  platforms: Platform[];
  publisher?: string;
  release_date?: ISODate;
  ingame_name_regex?: string;
  active?: boolean;
}

export interface UpdateGameInput {
  name?: string;
  slug?: string;
  logo_url?: string;
  banner_url?: string;
  platforms?: Platform[];
  publisher?: string;
  release_date?: ISODate;
  ingame_name_regex?: string;
  active?: boolean;
}

export interface CreateGameModeInput {
  name: string;
  slug: string;
  team_size?: number;
  max_teams?: number;
  description?: string;
  active?: boolean;
}

export interface UpdateGameModeInput {
  name?: string;
  slug?: string;
  team_size?: number;
  max_teams?: number;
  description?: string;
  active?: boolean;
}

export interface CreateGameMapInput {
  name: string;
  slug: string;
  image_url?: string;
  active?: boolean;
}

export interface UpdateGameMapInput {
  name?: string;
  slug?: string;
  image_url?: string;
  active?: boolean;
}

// DELETE /platform/catalog/games/:id response
export interface DeleteGameOutcome {
  hard_deleted: boolean;
  references: number;
}
