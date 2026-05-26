import type { ApiClient } from "../client/client";
import type { PaginatedResponse } from "../types/shared";
import type {
  CreateMatchInput,
  CreatePresetInput,
  CreateScrimInput,
  ListPresetsQuery,
  ListScrimsQuery,
  Match,
  Preset,
  PresetMap,
  PresetMapInput,
  Scrim,
  UpdateMatchInput,
  UpdatePresetInput,
  UpdatePresetStatusInput,
  UpdatePresetStatusResponse,
  UpdateScrimInput,
} from "../types/scrims";

const base = "/api/v1";

export const scrimEndpoints = {
  // ----- scrims -----

  create: (api: ApiClient, body: CreateScrimInput) =>
    api.post<Scrim>(`${base}/scrims`, { body }),

  list: (api: ApiClient, query?: ListScrimsQuery) =>
    api.get<PaginatedResponse<Scrim>>(`${base}/scrims`, {
      query,
    }),

  get: (api: ApiClient, id: number) => api.get<Scrim>(`${base}/scrims/${id}`),

  getByPublicId: (api: ApiClient, publicId: string) =>
    api.get<Scrim>(`${base}/scrims/p/${publicId}`),

  getByInviteCode: (api: ApiClient, code: string) =>
    api.get<Scrim>(`${base}/scrims/invite/${code}`),

  update: (api: ApiClient, id: number, body: UpdateScrimInput) =>
    api.patch<Scrim>(`${base}/scrims/${id}`, { body }),

  delete: (api: ApiClient, id: number) =>
    api.delete<void>(`${base}/scrims/${id}`),

  promote: (api: ApiClient, id: number) =>
    api.post<Scrim>(`${base}/scrims/${id}/promote`),

  openRegistration: (api: ApiClient, id: number) =>
    api.post<Scrim>(`${base}/scrims/${id}/open-registration`),

  closeRegistration: (api: ApiClient, id: number) =>
    api.post<Scrim>(`${base}/scrims/${id}/close-registration`),

  start: (api: ApiClient, id: number) => api.post<Scrim>(`${base}/scrims/${id}/start`),

  end: (api: ApiClient, id: number) => api.post<Scrim>(`${base}/scrims/${id}/end`),

  cancel: (api: ApiClient, id: number) =>
    api.post<Scrim>(`${base}/scrims/${id}/cancel`),

  // ----- presets -----

  createPreset: (api: ApiClient, body: CreatePresetInput) =>
    api.post<Preset>(`${base}/scrim-preset`, { body }),

  listPresets: (api: ApiClient, query?: ListPresetsQuery) =>
    api.get<PaginatedResponse<Preset>>(`${base}/scrim-preset`, {
      query,
    }),

  getPreset: (api: ApiClient, id: number) =>
    api.get<Preset>(`${base}/scrim-preset/${id}`),

  updatePreset: (api: ApiClient, id: number, body: UpdatePresetInput) =>
    api.patch<Preset>(`${base}/scrim-preset/${id}`, { body }),

  updatePresetStatus: (api: ApiClient, id: number, body: UpdatePresetStatusInput) =>
    api.put<UpdatePresetStatusResponse>(`${base}/scrim-preset/${id}/status`, { body }),

  deletePreset: (api: ApiClient, id: number) =>
    api.delete<void>(`${base}/scrim-preset/${id}`),

  // Preset maps.
  addPresetMap: (api: ApiClient, presetId: number, body: PresetMapInput) =>
    api.post<PresetMap>(`${base}/scrim-preset/${presetId}/maps`, { body }),

  listPresetMaps: (api: ApiClient, presetId: number) =>
    api.get<PresetMap[]>(`${base}/scrim-preset/${presetId}/maps`),

  updatePresetMapOrder: (
    api: ApiClient,
    presetId: number,
    mapId: number,
    body: PresetMapInput,
  ) => api.patch<void>(`${base}/scrim-preset/${presetId}/maps/${mapId}`, { body }),

  removePresetMap: (api: ApiClient, presetId: number, mapId: number) =>
    api.delete<void>(`${base}/scrim-preset/${presetId}/maps/${mapId}`),

  // ----- match -----

  createMatch: (api: ApiClient, body: CreateMatchInput) =>
    api.post<Match>(`${base}/match`, { body }),

  getMatch: (api: ApiClient, id: number) =>
    api.get<Match>(`${base}/match/${id}`),

  getMatchByScrim: (api: ApiClient, scrimId: number) =>
    api.get<Match>(`${base}/match/scrims/${scrimId}`),

  updateMatchMap: (api: ApiClient, id: number, body: UpdateMatchInput) =>
    api.put<Match>(`${base}/match/${id}`, { body }),

  startMatch: (api: ApiClient, id: number) =>
    api.post<Match>(`${base}/match/${id}/start`),

  endMatch: (api: ApiClient, id: number) =>
    api.post<Match>(`${base}/match/${id}/end`),

  deleteMatch: (api: ApiClient, id: number) =>
    api.delete<void>(`${base}/match/${id}`),
};
