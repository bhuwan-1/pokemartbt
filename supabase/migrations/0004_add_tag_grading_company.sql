-- Add 'TAG' to the allowed grading companies.
-- The app layer (Zod schema + admin form) already offers TAG, but the
-- column-level CHECK constraint from 0001_init.sql only allowed
-- ('PSA','CGC','BGS','SGC'), so saving a TAG-graded product failed with
-- products_grading_company_check. Keep the DB in sync with the Zod enum.

alter table public.products
  drop constraint products_grading_company_check;

alter table public.products
  add constraint products_grading_company_check
  check (grading_company in ('PSA','CGC','BGS','SGC','TAG'));
