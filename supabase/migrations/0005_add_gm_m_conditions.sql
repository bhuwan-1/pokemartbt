-- Add 'GM' (Gem Mint) and 'M' (Mint) as single-card conditions.
-- These are higher grades than NM and apply to singles only (never sealed),
-- so they go into both the column-level condition check and the
-- single_condition_chk. Keep this in sync with the Zod conditionSingle enum.

alter table public.products
  drop constraint products_condition_check;

alter table public.products
  add constraint products_condition_check
  check (condition in ('GM','M','NM','LP','MP','HP','DMG','SEALED'));

alter table public.products
  drop constraint single_condition_chk;

alter table public.products
  add constraint single_condition_chk
  check (product_type <> 'single' or condition in ('GM','M','NM','LP','MP','HP','DMG'));
