-- pokemartbt — add `discount_percent` for on-sale pricing.
-- Run in the Supabase SQL editor after 0002_add_is_featured.sql.
-- `price` remains the original/list price; the discounted price is derived in the client.
-- A product is "on sale" exactly when discount_percent > 0.
-- Column-level addition; existing RLS policies (anon read active rows, writes authenticated)
-- already cover this column — no policy changes needed.

alter table public.products
  add column if not exists discount_percent numeric(5,2) not null default 0
    check (discount_percent >= 0 and discount_percent <= 100);
