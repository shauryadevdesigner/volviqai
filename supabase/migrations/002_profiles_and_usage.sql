-- Volviq user profiles (linked to Supabase Auth)

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  display_name text,
  goals text[] not null default '{}',
  business_type text,
  platform text,
  onboarding_completed_at timestamptz,
  plan text not null default 'free' check (plan in ('free', 'pro', 'business')),
  generations_used_this_month integer not null default 0,
  billing_period_start date not null default (date_trunc('month', now())::date),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_username_idx on public.profiles (username);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Allow checking username availability (authenticated users only see own row by default;
-- use a security definer function for username checks)
create or replace function public.is_username_available(check_username text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.profiles
    where lower(username) = lower(check_username)
  );
$$;

grant execute on function public.is_username_available(text) to authenticated;

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Increment generation usage (called from app after successful generation)
create or replace function public.increment_generation_usage(user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_row public.profiles%rowtype;
  plan_limit integer;
begin
  select * into profile_row from public.profiles where id = user_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'profile_not_found');
  end if;

  -- Reset monthly counter if billing period rolled over
  if profile_row.billing_period_start < date_trunc('month', now())::date then
    update public.profiles
    set generations_used_this_month = 0,
        billing_period_start = date_trunc('month', now())::date,
        updated_at = now()
    where id = user_id;
    profile_row.generations_used_this_month := 0;
  end if;

  plan_limit := case profile_row.plan
    when 'pro' then 50
    when 'business' then 300
    else 3
  end;

  if profile_row.generations_used_this_month >= plan_limit then
    return jsonb_build_object(
      'ok', false,
      'error', 'limit_reached',
      'used', profile_row.generations_used_this_month,
      'limit', plan_limit
    );
  end if;

  update public.profiles
  set generations_used_this_month = generations_used_this_month + 1,
      updated_at = now()
  where id = user_id;

  return jsonb_build_object(
    'ok', true,
    'used', profile_row.generations_used_this_month + 1,
    'limit', plan_limit
  );
end;
$$;

grant execute on function public.increment_generation_usage(uuid) to authenticated;
