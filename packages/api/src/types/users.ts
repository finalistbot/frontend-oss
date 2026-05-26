import type { ISODateTime, Int32, Int64 } from "./shared";

export interface GameIdentity {
  id: Int64;
  user_id: Int64;
  game_id: Int32;
  ingame_name: string;
  game_name?: string;
  game_slug?: string;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface SetGameIdentityInput {
  ingame_name: string;
}

export interface UploadResponse {
  url: string;
}
