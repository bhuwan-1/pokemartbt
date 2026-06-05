---
description: Audit the codebase against SPEC.md, design.md, and CLAUDE.md and report drift.
---

# /spec-audit

Audit this repository against its specification. **Report findings — do not fix anything unless I explicitly ask.** Be direct and assign confidence; flag uncertainty rather than guessing.

## Inputs

Read in full before auditing:

- `SPEC.md` (behavior, schema, acceptance criteria §14)
- `design.md` (tokens, components)
- `CLAUDE.md` (golden rules, conventions)

## What to check

### A. Security & golden rules (highest priority — a failure here is ❌, not ⚠️)

1. **RLS:** every table in `supabase/migrations/` has RLS enabled with explicit policies. `products`: `anon` SELECT limited to `is_active = true`; no `anon` `INSERT`/`UPDATE`/`DELETE`; writes restricted to `authenticated`. Storage `product-images`: writes restricted to `authenticated`.
2. **No service-role key** referenced anywhere in `src/` or client env (`VITE_*`). Only the anon key is used client-side.
3. **DB coherence constraints** present on `products` (single vs sealed condition, sealed-not-graded, graded-requires-company+grade) and consistent with the Zod schema.
4. **Non-goals not violated:** no user auth/login, no payment/checkout, no order/shipping tables or flows, no server-persisted cart, no realtime, no multi-tenant.
5. **Admin not linked** from any customer-facing nav; `/admin*` routes exist behind the guard.
6. **No fake stats / newsletter UI** ported from the mockups. Store brand name is a swappable constant, not a hardcoded "PokéMarket".

### B. Data model & validation

- `products` columns and types match SPEC §6 (incl. `product_type`, `image_paths text[]`).
- `schemas/product-schema.ts` is a `discriminatedUnion` on `product_type`; image files validated for type (PNG/JPG/WEBP) and ≤10MB.
- Types are inferred from Zod, not duplicated by hand.

### C. Features (against SPEC §10 + acceptance §14)

- Public catalog: no auth, type/set/condition/price filters + sort, URL-driven, loading/empty states.
- Product detail: multi-image gallery, cover = `image_paths[0]`, graded display.
- Cart: localStorage, badge, add/remove/qty/clear.
- WhatsApp: `wa.me` link, readable encoded message, correct total, oversize-cart summarization.
- Admin: login/guard, type selector with conditional fields (sealed forces `condition='SEALED'`, `is_graded=false`), multi-image upload with reorder/cover/remove, delete also removes storage objects.
- TanStack Query keys + invalidation per SPEC §12.

### D. Conventions (CLAUDE.md)

- kebab-case filenames; **no barrel `index.ts` files**; feature-folder layout; `@/*` alias.
- Storage **paths** stored, not URLs.
- `design.md` tokens used (no ad-hoc hex); `card-lift`/`holo-sweep` reused.

### E. Build health

- `npm run typecheck` and `npm run lint` results.

## Output format

A grouped report (A–E). For each item:

- **✅ Pass** — one line.
- **⚠️ Drift** — convention/feature gap. File path(s) + the specific gap + suggested fix.
- **❌ Violation** — security/golden-rule/non-goal breach. File path(s) + why it's serious + required fix.

End with: a count summary, the **top 3 fixes by priority** (security first), and an explicit note of anything you could not verify and why.
