<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# FixMate Client — Agent Notes

## Repo shape

- Next.js 16 App Router frontend only (React 19, Tailwind v4, TypeScript). The backend lives in a separate repo and is called over HTTP; there is no API proxy/rewrite in `next.config.ts`.
- `app/(public)` = marketing/auth/services with navbar/footer. `app/dashboard/{customer,technician,admin}` = role dashboards. `app/payment/{success,cancel}` = Stripe return pages. `app/api/auth/[...all]` = BetterAuth handler.
- `components/ui` is ~60 generated shadcn components; other component folders are feature code.

## Commands and verification

- `npm install`, then `npm run dev` (Turbopack, http://localhost:3000).
- There is no test script, no test files, and no CI. Use `npm run typecheck` and `npm run build` as the gates.
- `npm run lint` is currently red from two pre-existing `react-hooks/set-state-in-effect` errors in `components/ui/carousel.tsx` and `hooks/use-mobile.ts`, plus many `@next/next/no-img-element` warnings. Don't chase these unless the task is about them. Focused lint: `npx eslint <path>`.
- Prettier config is no semicolons, double quotes, LF, 80 cols, Tailwind class sorting — but the tree is not Prettier-clean. Avoid repo-wide `npm run format`; it rewrites many unrelated files.

## Data and auth

- Except for BetterAuth's own Mongo storage, all business data comes from `NEXT_PUBLIC_API_URL`. Code fallback and `.env.local` use `http://localhost:8000`; the README's `:5000` is stale. The backend must be running separately or pages show empty/error states.
- Client components use `authClient.useSession()` and `getAuthHeaders()` (`lib/auth-token.ts`) to send the BetterAuth session token as `Authorization: Bearer ...` to the backend.
- Dashboard auth/role protection is client-side in `app/dashboard/layout.tsx`; there is no middleware/proxy. `lib/core/server.ts` (`authFetch`, `protectedMutation`, `requireRole`) exists but is unused — follow the existing client-fetch pattern unless intentionally migrating.
- BetterAuth config: `lib/auth.ts` (Mongo adapter, DB name hardcoded as `fixmatedb`); client: `lib/auth-client.ts`. Self-signup can only create `customer`/`technician`; `lib/auth.ts` coerces anything else, including `admin`, to `customer`. Promote admins directly in Mongo.
- Booking statuses are exactly `requested`, `accepted`, `in-progress`, `completed`, `cancelled`, `rejected`; service approval is `pending`/`approved`/`rejected`. Editing a service resets approval to `pending`; completing a job requires a positive `finalAmount`; Stripe payment is only allowed for `completed` + unpaid bookings.
- README also claims server-side search/filter; `/services` filtering actually happens client-side in `components/services/services-browser.tsx`.

## Conventions and quirks

- Most dashboard pages are `"use client"` and fetch in `useEffect`; `/services/[id]` is the notable server component (`fetch` + `notFound`).
- Backend URLs are repeated inline as `const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"` plus `/api/...`; match that style when adding calls.
- `components/ui` is shadcn `base-nova` built on `@base-ui/react`, not Radix. `cn` comes from the `cn` npm package (`lib/utils.ts` only re-exports it). Prefer the shadcn CLI (`components.json`) for new primitives.
- Theme tokens are CSS variables in `app/globals.css` (`primary` teal, `brand-amber`, `font-heading`). Use those instead of hard-coded colors.
- External images (ImgBB) use plain `<img>`; `no-img-element` warnings are expected. `next.config.ts` permits all HTTPS image hosts if you switch to `next/image`.
- Image uploads go through `lib/imgbb.ts` (`NEXT_PUBLIC_IMGBB_API_KEY`, 5 MB limit).
- Next 16: dynamic `params` is a Promise (`await params`), and any `useSearchParams` caller needs a `<Suspense>` boundary (see the sign-in and services pages).

## Environment

`.env.local` is gitignored and must define `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `BETTER_AUTH_DB_URI`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_API_URL`, and `NEXT_PUBLIC_IMGBB_API_KEY`. Optional: `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` (enables Google login) and `BETTER_AUTH_TRUSTED_ORIGINS` (comma-separated). `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` both feed trusted origins, so keep them aligned with the real origin.
