# pokemartbt — Specification

> Single-seller Pokémon card storefront. Public, no-auth catalog with a WhatsApp-based checkout handoff, plus an authenticated admin inventory manager. Direct client → Supabase; no custom backend.

---

## 1. Overview

A public web store where visitors browse Pokémon products (individual cards and sealed sets), add them to a client-side cart, and complete the order by opening a pre-filled WhatsApp chat with the seller. There is **no payment, order, or shipping logic in the app** — the transaction is negotiated in WhatsApp. A single admin (the seller) logs in to manage inventory.

## 2. Goals / Non-Goals

**Goals**

- Fast, mobile-first public catalog with filtering and sorting.
- One-tap "Order via WhatsApp" with a readable pre-filled cart message.
- Authenticated admin CRUD over inventory, including multi-image upload and a product-type classifier (individual card vs sealed set).
- Correct security posture: RLS is the real access control, not the UI.

**Non-Goals (explicitly out of scope)**

- User accounts / customer login / customer profiles.
- Payment processing, checkout, server-persisted carts, order records, order tracking, shipping/fulfillment state.
- Email/newsletter capture.
- Realtime subscriptions.
- Multi-seller / multi-tenant.
- Automated stock decrement (seller reconciles inventory manually after closing a sale in chat).

## 3. Tech Stack

- **Build:** Vite + React + TypeScript.
- **Routing:** React Router (v7).
- **Server state:** TanStack Query.
- **Forms / validation:** React Hook Form + Zod (`@hookform/resolvers`).
- **UI:** Tailwind CSS + shadcn/ui (design tokens in `design.md`).
- **Backend:** Supabase — Postgres (data), Storage (images), Auth (admin only).
- **Conventions:** kebab-case filenames, no barrel (`index.ts`) files, feature-based folders.

## 4. Architecture

```
Browser (React SPA)
  ├─ Public routes  ──┐
  │                   ├─ supabase-js (anon key) ── Supabase Postgres (RLS) + Storage (public read)
  └─ Admin routes  ───┘                              └─ Supabase Auth (single admin)
        │
        └─ WhatsApp handoff: wa.me/<number>?text=<url-encoded cart>
```

The anon key ships in the bundle by design. **All access control lives in RLS and storage policies**, not in React.

## 5. Security Model — CRITICAL

Read this section before writing policies. Getting it wrong means anyone can wipe inventory with the key visible in their devtools.

1. **`products` table:** RLS **enabled**. `anon` may `SELECT` active rows only. `anon` has **no** `INSERT`/`UPDATE`/`DELETE`. All writes restricted to `authenticated`.
2. **Storage bucket (`product-images`):** public read (bucket marked public); `INSERT`/`UPDATE`/`DELETE` restricted to `authenticated`.
3. **Single admin account:** created manually in the Supabase dashboard. **Public sign-ups disabled** in Auth settings. No signup UI is built.
4. **Route guard is cosmetic:** it hides admin UI for UX, protects nothing. The lock is RLS.
5. **No service-role key in the frontend, ever.** Only `VITE_SUPABASE_ANON_KEY`.

## 6. Data Model

Single table `products`. A `product_type` discriminator distinguishes individual cards from sealed product; card attributes are real, filterable/sortable columns — not buried in a description blob.

| Column            | Type                             | Notes                                                                 |
| ----------------- | -------------------------------- | --------------------------------------------------------------------- |
| `id`              | uuid PK                          | `gen_random_uuid()`                                                   |
| `product_type`    | text, not null                   | enum: `single`, `sealed`. UI labels: "Individual Card" / "Sealed Set" |
| `name`            | text, not null                   | e.g. "Charizard GX — Hidden Fates SV49/SV94"                          |
| `set_name`        | text                             | expansion, e.g. "Brilliant Stars", "Obsidian Flames"                  |
| `card_number`     | text                             | singles only, e.g. "4/102"                                            |
| `rarity`          | text                             | singles only, e.g. "Common", "Holo Rare"                              |
| `language`        | text, not null, default `'EN'`   |                                                                       |
| `condition`       | text, not null                   | enum: `NM`,`LP`,`MP`,`HP`,`DMG` (singles) or `SEALED` (sealed)        |
| `is_graded`       | bool, not null, default `false`  | singles only                                                          |
| `grading_company` | text                             | enum: `PSA`,`CGC`,`BGS`,`SGC` (null unless graded)                    |
| `grade`           | numeric(3,1)                     | 1–10 (null unless graded)                                             |
| `price`           | numeric(10,2), not null          | `>= 0`                                                                |
| `currency`        | text, not null, default `'USD'`  | store-wide; see Open Decisions                                        |
| `quantity`        | int, not null, default `1`       | `>= 0`; singles usually 1, sealed often >1                            |
| `is_active`       | bool, not null, default `true`   | master visibility switch                                              |
| `is_featured`     | bool, not null, default `false`  | surfaced in the home-page Featured Collections bento (migration 0002) |
| `image_paths`     | text[], not null, default `'{}'` | ordered storage object paths; **index 0 = cover**                     |
| `description`     | text                             | freeform notes                                                        |
| `created_at`      | timestamptz, not null            | `now()`                                                               |
| `updated_at`      | timestamptz, not null            | maintained by trigger                                                 |

**Type coherence (enforced at DB level, see §7):**

- `single` → `condition` ∈ {NM,LP,MP,HP,DMG}; may be graded.
- `sealed` → `condition` = `SEALED`; never graded; `rarity`/`card_number` left null.
- Graded singles must carry both `grading_company` and `grade`.

**Visibility rule:** `is_active` is the master switch. Sold-out items: set `is_active = false` (or `quantity = 0` and let the catalog filter `quantity > 0` — pick one, §15). 1-of-1 singles get flipped inactive once sold.

## 7. Supabase Setup (run in SQL editor)

```sql
-- 7.1 Table
create table public.products (
  id              uuid primary key default gen_random_uuid(),
  product_type    text not null check (product_type in ('single','sealed')),
  name            text not null,
  set_name        text,
  card_number     text,
  rarity          text,
  language        text not null default 'EN',
  condition       text not null check (condition in ('NM','LP','MP','HP','DMG','SEALED')),
  is_graded       boolean not null default false,
  grading_company text check (grading_company in ('PSA','CGC','BGS','SGC')),
  grade           numeric(3,1) check (grade >= 1 and grade <= 10),
  price           numeric(10,2) not null check (price >= 0),
  currency        text not null default 'USD',
  quantity        integer not null default 1 check (quantity >= 0),
  is_active       boolean not null default true,
  image_paths     text[] not null default '{}',
  description     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- type coherence (defense in depth; mirrors the Zod discriminated union)
  constraint single_condition_chk check (
    product_type <> 'single' or condition in ('NM','LP','MP','HP','DMG')
  ),
  constraint sealed_condition_chk check (
    product_type <> 'sealed' or condition = 'SEALED'
  ),
  constraint sealed_not_graded_chk check (
    product_type <> 'sealed' or (is_graded = false and grading_company is null and grade is null)
  ),
  constraint graded_requires_fields_chk check (
    is_graded = false or (grading_company is not null and grade is not null)
  )
);

-- indexes for catalog filtering/sorting
create index products_active_idx  on public.products (is_active);
create index products_type_idx    on public.products (product_type);
create index products_set_idx     on public.products (set_name);
create index products_price_idx   on public.products (price);
create index products_created_idx on public.products (created_at desc);

-- 7.2 updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- 7.3 RLS
alter table public.products enable row level security;

-- Public: read ACTIVE rows only
create policy "public_read_active_products"
  on public.products for select
  to anon
  using (is_active = true);

-- Admin: read everything (incl. inactive)
create policy "admin_read_all_products"
  on public.products for select
  to authenticated
  using (true);

-- Admin: write
create policy "admin_insert_products"
  on public.products for insert
  to authenticated with check (true);

create policy "admin_update_products"
  on public.products for update
  to authenticated using (true) with check (true);

create policy "admin_delete_products"
  on public.products for delete
  to authenticated using (true);
```

**Storage** (bucket `product-images`, marked **public** in the dashboard):

```sql
-- Public read is served via the public object URL when the bucket is public;
-- no SELECT policy on storage.objects is required for <img src> rendering.
-- Restrict writes to the admin:

create policy "admin_upload_product_images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

create policy "admin_update_product_images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images');

create policy "admin_delete_product_images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images');
```

**Auth (dashboard, manual):** create the single admin user; disable public sign-ups; (optional) restrict to that one email.

## 8. Frontend Structure

```
src/
  main.tsx
  app.tsx                         # router + providers
  lib/
    supabase.ts                   # createClient(url, anonKey)
    query-client.ts               # QueryClient config
    utils.ts                      # cn(), formatters
  components/
    ui/                           # shadcn primitives
    layout/                       # header, footer, mobile-nav
  features/
    home/
      home-page.tsx                # landing: hero + featured + how-to-order + CTA
      components/
        hero.tsx
        featured-collections.tsx   # bento grid of is_featured products
        how-to-order.tsx
        home-cta.tsx
    catalog/
      catalog-page.tsx
      product-detail-page.tsx
      components/
        product-card.tsx
        product-filters.tsx
        product-gallery.tsx        # multi-image viewer (detail page)
      hooks/
        use-products.ts            # list query
        use-product.ts             # detail query
        use-featured-products.ts   # active + is_featured, for the home bento
    cart/
      cart-store.ts                # localStorage-backed
      use-cart.ts
      cart-sheet.tsx
    admin/
      admin-login-page.tsx
      inventory-page.tsx
      product-form.tsx             # create + edit (type-aware)
      components/
        product-type-selector.tsx  # "Individual Card" / "Sealed Set" radio-cards
        condition-pills.tsx        # NM/LP/MP/HP/D toggle group
        image-uploader.tsx         # dropzone + ordered thumbnail row
      hooks/
        use-admin-products.ts      # admin list (sees inactive)
        use-product-mutations.ts   # create/update/delete + invalidation
        use-image-upload.ts
    auth/
      auth-context.tsx             # session + onAuthStateChange
      require-auth.tsx             # route guard (cosmetic)
  features/whatsapp/
    build-whatsapp-link.ts
  schemas/
    product-schema.ts              # zod discriminated union
  types/
    product.ts
```

No barrel files. Filenames kebab-case.

## 9. Routing

```
/                       home / landing (public) — hero, featured collections, how-to-order, CTA
/catalog                catalog with filters + sort (public)
/card/:id               product detail (public)
/admin/login            admin login (public; redirects to /admin if already authed)
/admin                  inventory list   (guarded)
/admin/new              create product   (guarded)
/admin/:id/edit         edit product     (guarded)
```

`require-auth.tsx` wraps the guarded routes: reads session from `auth-context`; if none, redirect to `/admin/login`. The `/admin*` paths are **not** linked from the customer-facing nav.

## 10. Features

### 10.1 Catalog (public)

- Grid of `product-card`s. Query reads active products via anon key. Card shows cover image (`image_paths[0]`).
- Filters: **product type** (All / Singles / Sealed), `set_name`, `condition`, `is_graded`, price range; sort by newest / price asc / price desc. Implement as query params so views are shareable.
- Empty and loading states.

### 10.2 Product detail (public)

- `product-gallery` showing all `image_paths` (cover + thumbnails to switch).
- All attributes: type, set, number, rarity, condition, grade/company if graded, language, price, description.
- "Order via WhatsApp" (single-item) and "Add to cart".

### 10.3 Cart (client-only)

- Lives entirely in `localStorage`. No server persistence.
- Per line, minimum: `id`, `name`, `set_name`, `condition`, `grade`, `price`, `currency`, `qty`. Add/remove/update qty; clear.
- Cart badge in header/mobile nav.

### 10.4 WhatsApp checkout

- Composes a readable message and opens `https://wa.me/<number>?text=<encoded>`.
- One line per item; include a total. Encode with `encodeURIComponent`.
- **URL length:** very large carts can exceed practical URL limits and get truncated. If the message exceeds ~1500 chars, send a summarized version (item count + total + a note to discuss details in chat).

```ts
// features/whatsapp/build-whatsapp-link.ts
type CartLine = {
  name: string
  set_name?: string | null
  condition: string
  grade?: number | null
  price: number
  currency: string
  qty: number
}

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER // intl, digits only, no '+'

export function buildWhatsappLink(lines: CartLine[]): string {
  const body = lines
    .map((l) => {
      const grade = l.grade ? ` (Graded ${l.grade})` : ''
      const set = l.set_name ? ` — ${l.set_name}` : ''
      return `• ${l.qty}× ${l.name}${set} [${l.condition}]${grade} — ${l.currency} ${l.price.toFixed(2)}`
    })
    .join('\n')

  const total = lines.reduce((s, l) => s + l.price * l.qty, 0)
  const currency = lines[0]?.currency ?? ''
  const message = `Hi! I'd like to order from pokemartbt:\n\n${body}\n\nTotal: ${currency} ${total.toFixed(2)}`

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
```

### 10.5 Admin auth

- `supabase.auth.signInWithPassword`. Session tracked via `onAuthStateChange` in `auth-context`. Logout button. No signup.

### 10.6 Inventory management (create / edit)

Mirrors the "Create New Product" mockup. Single form, two-column on desktop.

- **Product classification (top):** two selectable radio-cards — "Individual Card" (`single`) / "Sealed Set" (`sealed`). The selection drives which fields render and which Zod branch validates.
- **Conditional fields:**
  - `single` → show `card_number`, `rarity`, condition pills (NM/LP/MP/HP/D → stored as `DMG`), and a **Graded** toggle that reveals `grading_company` + `grade`.
  - `sealed` → hide rarity/grading/condition; `condition` is set to `SEALED` and `is_graded=false` on submit.
- **General:** `name` (title), `description`.
- **Pricing & stock:** `price`, `quantity`.
- **Metadata:** `set_name`; (singles) `rarity`, `condition`.
- Actions: **Publish Product** (create) / **Save** (edit), **Cancel**. Toggle `is_active` and edit `quantity` from the list or the edit form.
- Confirm before delete. **Deleting a product also deletes all its storage objects** (iterate `image_paths`).

### 10.7 Image upload (multiple)

- **Decision:** images are stored as an **ordered `text[]` of storage paths** on the product row — not a child table. This covers multiple images, ordering, and reordering with far less code; first element is the cover. (Upgrade to a `product_images` table only if per-image metadata like alt text/captions is later needed — §15.)
- UI: dropzone ("Click to upload or drag and drop") + a thumbnail row showing existing images with `+` tiles to add more. Support reorder (drag or move buttons) and per-image remove.
- Constraints (match mockup): **PNG/JPG/WEBP, max 10MB each.** Validate client-side before upload.
- Flow: upload each File to `product-images`, collect the returned **paths**, write the ordered array to `image_paths`. Store paths, not full URLs; derive public URLs at render via `getPublicUrl`.
- On remove/replace: delete the storage object **and** drop its path from the array.

## 11. Validation (Zod)

Discriminated union on `product_type` — the type selector is the discriminant, so the resolver validates the matching shape.

```ts
// schemas/product-schema.ts
import { z } from 'zod'

const conditionSingle = z.enum(['NM', 'LP', 'MP', 'HP', 'DMG'])
const gradingCompany = z.enum(['PSA', 'CGC', 'BGS', 'SGC'])

const baseFields = {
  name: z.string().min(1, 'Title is required'),
  set_name: z.string().trim().optional().nullable(),
  language: z.string().default('EN'),
  price: z.coerce.number().nonnegative('Price must be ≥ 0'),
  currency: z.string().default('USD'),
  quantity: z.coerce.number().int().nonnegative().default(1),
  is_active: z.boolean().default(true),
  description: z.string().trim().optional().nullable(),
}

export const singleSchema = z
  .object({
    product_type: z.literal('single'),
    ...baseFields,
    card_number: z.string().trim().optional().nullable(),
    rarity: z.string().trim().optional().nullable(),
    condition: conditionSingle,
    is_graded: z.boolean().default(false),
    grading_company: gradingCompany.optional().nullable(),
    grade: z.coerce.number().min(1).max(10).optional().nullable(),
  })
  .refine((v) => !v.is_graded || (v.grading_company != null && v.grade != null), {
    message: 'Graded cards require a grading company and grade',
    path: ['grade'],
  })

export const sealedSchema = z.object({
  product_type: z.literal('sealed'),
  ...baseFields,
  // condition is forced to "SEALED" and is_graded=false on submit; not user fields
})

export const productSchema = z.discriminatedUnion('product_type', [singleSchema, sealedSchema])
export type ProductInput = z.infer<typeof productSchema>

// Image files are validated separately (File objects, pre-upload)
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024 // 10MB
export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
export const imageFileSchema = z
  .instanceof(File)
  .refine((f) => f.size <= MAX_IMAGE_BYTES, 'Max 10MB')
  .refine((f) => ACCEPTED_IMAGE_TYPES.includes(f.type), 'PNG, JPG, or WEBP only')
```

Use with `react-hook-form` via `zodResolver`. Optionally parse Supabase read responses with a `productRowSchema` for runtime safety.

## 12. Data Fetching (TanStack Query)

- Query keys: `['products', filters]` (public), `['admin-products']` (admin), `['product', id]`.
- Public list query filters `is_active = true` server-side (and optionally `quantity > 0`); applies type/set/condition/price filters.
- Mutations (create/update/delete) invalidate `['admin-products']`, the relevant `['product', id]`, and `['products']` so the public catalog reflects changes.
- Sensible `staleTime` for the catalog (it changes infrequently).

## 13. Environment & Config

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_WHATSAPP_NUMBER=     # international format, digits only, no '+'
VITE_STORE_CURRENCY=USD   # single store-wide currency (see Open Decisions)
```

Never expose the service-role key. `.env` in `.gitignore`; commit `.env.example`.

## 14. Acceptance Criteria

- [ ] Public catalog loads with **no** auth; type/set/condition/price filters and sorting work and are URL-driven.
- [ ] Product detail shows a gallery of all images; cover is `image_paths[0]`; graded cards display company + grade.
- [ ] Add to cart persists across reload (localStorage); badge count correct.
- [ ] "Order via WhatsApp" opens `wa.me` with a readable, correctly-encoded message and correct total; oversized carts are summarized.
- [ ] **Security:** with only the anon key, a direct API `INSERT`/`UPDATE`/`DELETE` on `products` is **rejected**. Verify with curl/Postman, not just the UI.
- [ ] **Security:** anon cannot read rows where `is_active = false`.
- [ ] **Security:** anon cannot upload to `product-images`.
- [ ] Admin can log in; guarded routes redirect to `/admin/login` when unauthenticated.
- [ ] Admin can choose product type; the form shows the correct fields per type; saving a `sealed` product stores `condition='SEALED'`, `is_graded=false`.
- [ ] DB rejects incoherent rows (e.g. a `sealed` row with a grade, or `is_graded=true` without company/grade) even via direct API.
- [ ] Admin can upload multiple images (PNG/JPG/WEBP ≤10MB), reorder them, set the cover, and remove individual images; removing deletes the storage object.
- [ ] Deleting a product removes **all** its storage objects.
- [ ] No service-role key anywhere in the client bundle.
- [ ] Public-facing nav contains no link to `/admin*`.

## 15. Open Decisions

1. **Storefront branding.** Project is `pokemartbt`; mockups use "PokéMarket". Reselling genuine cards is generally fine, but using Pokémon marks in the storefront name/logo carries trademark risk. Decide the public-facing name. (Copy/logo only — not architecture.)
2. **Currency.** Defaulting to **USD** (mockups show `$`), wired via `VITE_STORE_CURRENCY` + the column default. Change to BTN/other if needed. The column already exists if you ever want per-item currency, but multi-currency display is out of MVP scope.
3. **Sold-out semantics.** Hide via `is_active = false`, or keep active and filter `quantity > 0`? Pick one and apply consistently.
4. **(Resolved) Multiple images** → ordered `image_paths text[]`, cover = index 0. Future upgrade path: `product_images` child table if per-image metadata is needed.
