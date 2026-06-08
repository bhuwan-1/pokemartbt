-- pokemartbt — add `is_featured` flag for the home page "Featured Collections" bento.
-- Run in the Supabase SQL editor after 0001_init.sql.
-- Column-level addition; existing RLS policies (anon read active rows, writes authenticated)
-- already cover this column — no policy changes needed.

alter table public.products
  add column if not exists is_featured boolean not null default false;

-- Supports the featured query: active + featured, newest first.
create index if not exists products_featured_idx
  on public.products (created_at desc)
  where is_featured and is_active;
