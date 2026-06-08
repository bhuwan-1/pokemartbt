# CLAUDE.md — pokemartbt

Operating instructions for Claude Code on this repo. Read this first, every session.

## What this is

Single-seller Pokémon card storefront: a public, no-auth catalog with a WhatsApp checkout handoff, plus an authenticated admin inventory manager. Direct client → Supabase, no custom backend.

**Sources of truth — read both before making changes:**

- `SPEC.md` — what to build (schema, RLS, features, acceptance criteria). Authoritative for behavior.
- `design.md` — how it looks (tokens, type scale, components, effects). Authoritative for UI.

This file does **not** restate them. It encodes the rules and workflow.

## Golden rules (non-negotiable)

1. **RLS is the access control — not the route guard.** The admin route guard is cosmetic UX. Never treat a client-side check as security. Every table is RLS-on with `anon` read-only (active rows) and writes restricted to `authenticated`.
2. **No service-role key in the frontend, ever.** Only `VITE_SUPABASE_ANON_KEY`. If a task seems to need the service key client-side, stop and flag it — the design is wrong, not the key choice.
3. **Respect the non-goals.** Do **not** add: user accounts/customer login, payments/checkout, order or shipping records, server-persisted carts, realtime, or multi-tenant. The order lives in WhatsApp; the cart lives in `localStorage`. If a request implies one of these, surface the conflict before building.
4. **Admin login is reachable; admin _management_ stays hidden.** _(Revised 2026-06-08 by owner decision.)_ A discreet **account icon in the header** and an **"Admin Login" link in the footer** point to `/admin/login` (single-seller convenience). Admin is kept out of the primary browse nav and the mobile bottom nav, and **no admin management UI** (inventory, product CRUD) is ever surfaced in customer-facing navigation. The route guard remains cosmetic — RLS is the real lock — so exposing the login entry point is not a security regression.
5. **No fake social proof or newsletter UI.** The Stitch mockups include "10,000+ collectors" stats and a newsletter signup — both are out of scope; don't port them.
6. **Branding name is undecided.** Don't hardcode "PokéMarket" as the public brand. Use a single config/constant for the store name so it's swappable (trademark decision pending).

## Stack

Vite + React + TypeScript · React Router v7 · TanStack Query · React Hook Form + Zod · Tailwind + shadcn/ui · Supabase (Postgres + Storage + Auth). Folder layout and routes are defined in `SPEC.md` §8–§9.

## Conventions

- **Filenames:** kebab-case (`product-form.tsx`, `use-products.ts`).
- **No barrel files.** No `index.ts` re-export hubs. Import from the concrete module.
- **Feature-based folders** under `src/features/*` (catalog, cart, admin, auth, whatsapp). Shared UI in `src/components`.
- **Path alias:** `@/*` → `src/*`.
- **Components:** function components + hooks. Co-locate a feature's components/hooks with the feature.
- **Zod is the source of types.** Infer types from schemas (`z.infer`) rather than hand-writing parallel interfaces. The product form validates against the `discriminatedUnion` in `schemas/product-schema.ts`.
- **Storage:** persist storage **paths** in `image_paths` (ordered; index 0 = cover), never full URLs. Derive public URLs at render via `getPublicUrl`.
- **TanStack Query keys:** `['products', filters]`, `['admin-products']`, `['product', id]`. Mutations invalidate the relevant keys (see SPEC §12).
- **Styling:** use the `design.md` tokens (mapped into Tailwind config / shadcn CSS variables). Don't introduce ad-hoc hex values. Reuse the `card-lift` / `holo-sweep` utilities.

## Database & Supabase

- Migrations live in `supabase/migrations/`. The SQL in `SPEC.md` §7 is the initial migration (schema, `CHECK` constraints, `updated_at` trigger, RLS, storage policies).
- **Every new table is RLS-on** with explicit `anon` / `authenticated` policies. Never ship a table with RLS disabled.
- The `products` table carries DB-level `CHECK` constraints for `product_type` coherence (single vs sealed, graded fields). Keep these in sync with the Zod schema — they are the last line of defense against bad data via the raw API.
- After any policy change, **verify anon cannot write**: hit the REST endpoint with only the anon key (curl/Postman) and confirm `INSERT`/`UPDATE`/`DELETE` on `products` and uploads to `product-images` are rejected. UI testing alone is insufficient.

## Commands

Expected npm scripts (read `package.json` if they differ):

| Command             | Purpose                      |
| ------------------- | ---------------------------- |
| `npm run dev`       | Vite dev server              |
| `npm run build`     | typecheck + production build |
| `npm run typecheck` | `tsc --noEmit`               |
| `npm run lint`      | ESLint (flat config)         |
| `npm run format`    | Prettier                     |

Husky + lint-staged run format/lint on pre-commit. Supabase: `supabase start` for local, migrations via the CLI or the dashboard SQL editor.

## Workflow

- **Spec-driven.** Read `SPEC.md` + `design.md`, then implement. If something you're asked to do contradicts them (especially the golden rules), say so and propose the resolution before coding — don't silently diverge.
- **Small, focused diffs.** One concern at a time. Don't refactor unrelated code.
- **Be direct about uncertainty.** State confidence levels; don't lead through speculative guesses without saying they're guesses.
- Run `/spec-audit` before declaring a task done.

## Definition of done

- `npm run typecheck` and `npm run lint` pass.
- The relevant `SPEC.md` §14 acceptance criteria are met.
- Security checks pass: RLS verified, no service-role key in the bundle, anon writes rejected, admin not in public nav.
- No new dependency on a non-goal feature.
