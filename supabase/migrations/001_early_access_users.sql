-- Volviq Early Access users table
-- Run in Supabase SQL Editor or via Supabase CLI

create extension if not exists "pgcrypto";

create table if not exists public.early_access_users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  company text,
  role text,
  created_at timestamptz not null default now()
);

create index if not exists early_access_users_email_idx on public.early_access_users (email);
create index if not exists early_access_users_created_at_idx on public.early_access_users (created_at desc);

alter table public.early_access_users enable row level security;

-- Allow anonymous inserts for the public early-access form (anon key only)
create policy "Allow public insert for early access"
  on public.early_access_users
  for insert
  to anon
  with check (true);

-- Restrict reads to authenticated service role / dashboard only
create policy "No public read on early access"
  on public.early_access_users
  for select
  to anon
  using (false);
