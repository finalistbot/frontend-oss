# Finalist frontend — agent guide

Single Next.js app (`apps/web`) split by route segment. Backend API docs live in `../backend/docs/` — the typed SDK in `@repo/api` mirrors that surface 1:1.

---

## Layout

```
apps/web/
  app/
    layout.tsx                 ← root: ThemeProvider → AuthProvider → ApiProvider
    (public)/                  ← unauthenticated landing, /login, /verify
    auth/
      callback/                ← OAuth completion handler
      setup-username/          ← username gate
    play/                      ← player surface (auth-guarded segment)
    manage/                    ← host/org surface (auth-guarded segment, sidebar/topbar chrome)
    logout/

packages/
  api/      ← typed SDK + React Query hooks for every backend endpoint
  auth/     ← AuthProvider, AuthGuard, /users/@me bootstrap, OAuth/OTP forms
  ui/       ← shared shadcn-style components
  lib/      ← utilities (no auth/api logic)
  types/    ← legacy shared types (PaginatedResponse re-exported)
```

URL prefixes (`/play`, `/manage`) are deliberate — they map 1:1 to subdomains if we ever split back into separate Vercel projects.

---

## Auth model

Backend issues both tokens as **HttpOnly cookies** (`access_token`, `refresh_token`). The frontend does **not** read or store them — `fetch(..., { credentials: "include" })` covers everything.

- Auth bootstrap: `AuthProvider` (`@repo/auth`) calls `GET /users/@me` on mount; refresh flow lives there.
- Refresh: a 401 from any data hook triggers `POST /auth/refresh`; the new pair lands as cookies; original request retries.
- The `ApiBridge` in `apps/web/core/providers/app-providers.tsx` plumbs `useAuth().refreshSession` into `@repo/api`'s `ApiProvider` so both subsystems share one refresh path.

### Username gate

Most backend routes return `403 username_required` until the user picks a username. Exempt: `/auth/*`, `/users/@me`, `/users/@me/username`, `/users/username-availability`. Frontend handles the gate via:
- `<AuthGuard>` (in segment layouts) — redirects to `/login` if unauthenticated, `/auth/setup-username` if `requires_username: true`.

### Platform admin auth

Distinct surface (`/api/v1/platform/auth/*`). Returns tokens in the **body** (no cookies); caller attaches `Authorization: Bearer`. Use `platformEndpoints` directly — no React Query hooks because admin sessions are short-lived and explicit.

---

## API consumption

```tsx
"use client";
import { useGames, useScrim, useCreateTeam } from "@repo/api";

function ScrimPage({ id }: { id: number }) {
  const { data: scrim, isLoading } = useScrim(id);
  const { data: games } = useGames({ active: true });
  const createTeam = useCreateTeam();

  if (isLoading) return null;
  // ...
}
```

- Every list endpoint returns `{ data, pagination }` — backend canonical shape (see `../backend/docs/README.md`).
- Errors are `ApiError` instances with a stable `code` field (snake_case, see backend per-module docs).
- Mutations auto-invalidate the relevant query keys via `queryClient.invalidateQueries`.

For raw fetch calls without React Query (e.g., server components): import the endpoint group + the client.

```ts
import { catalogEndpoints, ApiClient } from "@repo/api";

const api = new ApiClient({ baseUrl: process.env.NEXT_PUBLIC_API_URL! });
const games = await catalogEndpoints.listGames(api, { active: true });
```

---

## Pagination shape

```json
{
  "data": [...],
  "pagination": {
    "total": 137,
    "page": 2,
    "limit": 20,
    "total_pages": 7,
    "has_next_page": true,
    "has_prev_page": true
  }
}
```

`data` is never null. Use `PaginatedResponse<T>` from `@repo/api` or `@repo/types`.

---

## Error envelope

```json
{ "error": "human msg", "code": "stable_snake_case", "details": { "field": ["msg"] } }
```

Switch on `code`, not the message. Codes per module:
- Auth: see `backend/docs/auth.md`
- Teams/orgs/scrims/etc.: each module's doc has an "Error code summary" table.

In code:

```ts
import { isApiError } from "@repo/api";

try { await something(); }
catch (e) {
  if (isApiError(e) && e.code === "username_required") router.push("/auth/setup-username");
}
```

---

## Rules

1. All authentication logic lives in `@repo/auth`. Don't reach for cookies/localStorage in app code.
2. All API calls go through `@repo/api` (or `@repo/auth` for the OTP/setup flows that ship with the auth package).
3. `@repo/lib` is for pure utilities — no auth, no API.
4. New backend endpoint? Add it to `@repo/api/src/endpoints/<module>.ts` and a hook in `hooks/use-<module>.ts`. Update `query-keys.ts` if a new query is involved.
5. Use Tailwind + shared shadcn components from `@repo/ui`. App-local components live in `apps/web/components/`.

---

## Environment

`apps/web/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Backend OAuth callbacks redirect to `${FRONTEND_URL}/{path}`; configure backend `FRONTEND_URL=http://localhost:3000` to match.

---

## Dev / build

```sh
pnpm dev        # turbo dev — single Next app on :3000
pnpm build      # production build
pnpm check-types
pnpm lint
```
