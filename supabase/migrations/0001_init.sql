-- pokemartbt — initial schema (SPEC.md §7)
-- Run in the Supabase SQL editor (or `supabase db push`).
-- Storage policies at the bottom require the `product-images` bucket to exist first
-- (create it as a PUBLIC bucket in Dashboard → Storage).

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
  currency        text not null default 'BTN',
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
  to authenticated
  using (true);

-- Storage (bucket `product-images`, marked PUBLIC in the dashboard).
-- Public read is served via the public object URL; no SELECT policy needed for <img src>.
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
