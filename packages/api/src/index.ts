// Client core
export { ApiClient, type ApiClientConfig, type RequestOptions } from "./client/client";
export { ApiError, isApiError } from "./client/error";
export { ApiProvider, useApiClient } from "./client/provider";

// Endpoint groups (raw fetch fns; pass them an ApiClient)
export { identityEndpoints } from "./endpoints/identity";
export { userEndpoints } from "./endpoints/users";
export { teamEndpoints } from "./endpoints/teams";
export { organizationEndpoints } from "./endpoints/organizations";
export { catalogEndpoints } from "./endpoints/catalog";
export { scrimEndpoints } from "./endpoints/scrims";
export { registrationEndpoints } from "./endpoints/registrations";
export { platformEndpoints } from "./endpoints/platform";

// React Query hooks
export * from "./hooks/use-identity";
export * from "./hooks/use-users";
export * from "./hooks/use-teams";
export * from "./hooks/use-organizations";
export * from "./hooks/use-catalog";
export * from "./hooks/use-scrims";
export * from "./hooks/use-registrations";
export * from "./hooks/use-realtime";
export { queryKeys } from "./hooks/query-keys";

// Realtime
export { RealtimeSocket, type RealtimeSocketOptions } from "./realtime/socket";

// Types
export * from "./types/shared";
export * from "./types/identity";
export * from "./types/users";
export * from "./types/teams";
export * from "./types/organizations";
export * from "./types/catalog";
export * from "./types/scrims";
export * from "./types/registrations";
export * from "./types/platform";
export * from "./types/realtime";
