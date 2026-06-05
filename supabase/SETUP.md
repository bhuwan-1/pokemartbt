# Supabase Setup Checklist

One-time, manual steps in the [Supabase dashboard](https://supabase.com/dashboard). Order matters — the bucket must exist before the storage policies run.

## 1. Create the project

- New project → any name/region. Save the database password somewhere safe (not in this repo).

## 2. Create the storage bucket

- **Storage → New bucket** → name: `product-images` → check **Public bucket** → create.

## 3. Run the migration

- **SQL Editor → New query** → paste the full contents of `supabase/migrations/0001_init.sql` → Run.
- It creates the `products` table (with CHECK constraints + indexes), the `updated_at` trigger, RLS policies, and the storage write policies.

## 4. Create the single admin user

- **Authentication → Users → Add user** → email + password. This is the only account; there is no signup UI.

## 5. Disable public sign-ups

- **Authentication → Sign In / Up** → turn **off** "Allow new users to sign up".

## 6. Wire the frontend

- Copy `.env.example` → `.env`.
- **Settings → API**: copy the **Project URL** → `VITE_SUPABASE_URL`, and the **anon public** key → `VITE_SUPABASE_ANON_KEY`.
  - ⚠️ Never the `service_role` key — it must not exist anywhere in this repo or bundle.
- Set `VITE_WHATSAPP_NUMBER` (international format, digits only, no `+`).

## 7. Verify security (required — UI testing is insufficient)

```sh
./scripts/verify-rls.sh
```

It must report all checks passing: anon cannot INSERT/UPDATE/DELETE `products`, cannot read inactive rows, and cannot upload to `product-images`.
