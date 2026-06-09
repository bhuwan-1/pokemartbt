# pokemartbt

A single-seller **Pokémon card storefront**. Visitors browse a public, no-login catalog of individual cards and sealed sets, build a cart, and complete their order by opening a pre-filled **WhatsApp** chat with the seller. A single admin logs in to manage inventory.

There is **no payment, order, or shipping logic in the app** — the transaction is negotiated in WhatsApp. The client talks directly to Supabase; there is no custom backend.

## Features

- **Public catalog** — mobile-first browse with search, filtering (type, set, condition, price, graded), and sorting. No auth required.
- **Cart → WhatsApp handoff** — the cart lives in `localStorage`; "Order via WhatsApp" opens `wa.me` with a readable pre-filled message. No checkout, no server-persisted cart.
- **Admin inventory manager** — authenticated CRUD over products: multi-image upload, single-card vs sealed-set classification, graded-card fields, and quick toggles for active/featured status.
- **Security by RLS** — Supabase Row-Level Security is the real access control. `anon` can read active rows only; all writes require an authenticated session. The route guard is cosmetic.

## Tech stack

- **Build:** Vite + React + TypeScript
- **Routing:** React Router v7
- **Server state:** TanStack Query
- **Forms / validation:** React Hook Form + Zod
- **UI:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase — Postgres (data, RLS), Storage (images), Auth (admin only)

## Getting started

```bash
npm install
cp .env.example .env   # fill in the values below
npm run dev
```

### Environment variables

| Variable                 | Purpose                                            |
| ------------------------ | -------------------------------------------------- |
| `VITE_SUPABASE_URL`      | Supabase project URL                               |
| `VITE_SUPABASE_ANON_KEY` | Supabase **anon** key (never the service-role key) |
| `VITE_WHATSAPP_NUMBER`   | Seller's WhatsApp number, intl format, digits only |
| `VITE_STORE_CURRENCY`    | ISO display currency (e.g. `BTN`)                  |

> The anon key ships in the client bundle **by design** — all access control lives in RLS and storage policies, not in React. Never put a service-role key in the frontend.

### Database

Migrations live in `supabase/migrations/`. Apply the initial schema (tables, `CHECK` constraints, RLS, storage policies) via `supabase db push` or the Supabase SQL editor. The `product-images` Storage bucket must be created as **public** before the storage policies will apply.

## Scripts

| Command             | Purpose                      |
| ------------------- | ---------------------------- |
| `npm run dev`       | Vite dev server              |
| `npm run build`     | typecheck + production build |
| `npm run typecheck` | `tsc --noEmit`               |
| `npm run lint`      | ESLint (flat config)         |
| `npm run format`    | Prettier                     |

## Project docs

- **`SPEC.md`** — what to build: schema, RLS, features, acceptance criteria (authoritative for behavior).
- **`design.md`** — how it looks: tokens, type scale, components (authoritative for UI).
- **`CLAUDE.md`** — operating rules and workflow for working in this repo.
