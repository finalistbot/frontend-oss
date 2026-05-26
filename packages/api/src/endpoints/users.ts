import type { ApiClient } from "../client/client";
import type {
  GameIdentity,
  SetGameIdentityInput,
  UploadResponse,
} from "../types/users";

const base = "/api/v1";

export const userEndpoints = {
  listGameIdentities: (api: ApiClient) =>
    api.get<GameIdentity[]>(`${base}/users/@me/game-identity`),

  getGameIdentity: (api: ApiClient, gameId: number) =>
    api.get<GameIdentity>(`${base}/users/@me/game-identity/${gameId}`),

  setGameIdentity: (api: ApiClient, gameId: number, body: SetGameIdentityInput) =>
    api.put<GameIdentity>(`${base}/users/@me/game-identity/${gameId}`, { body }),

  deleteGameIdentity: (api: ApiClient, gameId: number) =>
    api.delete<void>(`${base}/users/@me/game-identity/${gameId}`),

  // Multipart image upload. Caller passes a Blob/File; we wrap it in FormData
  // here so the consumer doesn't have to construct one for every call.
  uploadImage: (api: ApiClient, file: File | Blob, filename?: string) => {
    const form = new FormData();
    form.append("file", file, filename);
    return api.post<UploadResponse>(`${base}/upload/image`, { rawBody: form });
  },
};
