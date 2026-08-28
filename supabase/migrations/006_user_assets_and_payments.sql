-- ============================================================================
-- 006: Multimodal Assets and Payment Infrastructure
-- ============================================================================

-- 1. USER ASSETS TABLE
create table if not exists public.user_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  filename text not null,
  mime_type text not null,
  size_bytes bigint not null,
  asset_type text not null check (asset_type in ('image', 'video')),
  role text default 'product',
  metadata jsonb default '{}'::jsonb,
  analysis jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_assets_user_id on public.user_assets(user_id);
alter table public.user_assets enable row level security;

create policy "Users can select own assets"
  on public.user_assets for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own assets"
  on public.user_assets for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete own assets"
  on public.user_assets for delete
  to authenticated
  using (auth.uid() = user_id);


-- 2. PAYMENTS & TRANSACTIONS TABLE
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('paypal', 'upi')),
  order_id text not null unique,
  provider_payment_id text,
  amount numeric(10,2) not null,
  currency text not null default 'INR',
  status text not null default 'PENDING'
    check (status in ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED')),
  plan text not null check (plan in ('free', 'pro', 'business')),
  credits_granted integer not null default 0,
  idempotency_key text unique not null,
  webhook_verified boolean not null default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_payments_user_id on public.payments(user_id);
create index if not exists idx_payments_order_id on public.payments(order_id);
alter table public.payments enable row level security;

create policy "Users can read own payments"
  on public.payments for select
  to authenticated
  using (auth.uid() = user_id);

-- Payment fulfillment procedure (RPC) for safe server-side / webhook entitlement
create or replace function public.fulfill_payment_entitlement(
  p_order_id text,
  p_provider_payment_id text,
  p_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.payments%rowtype;
  v_plan_limit integer;
begin
  select * into v_payment from public.payments where order_id = p_order_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'payment_not_found');
  end if;

  if v_payment.status = 'SUCCESS' then
    return jsonb_build_object('ok', true, 'status', 'already_fulfilled', 'plan', v_payment.plan);
  end if;

  v_plan_limit := case v_payment.plan
    when 'pro' then 50
    when 'business' then 300
    else 3
  end;

  -- Update payment status
  update public.payments
  set status = 'SUCCESS',
      provider_payment_id = coalesce(p_provider_payment_id, provider_payment_id),
      webhook_verified = true,
      credits_granted = v_plan_limit,
      updated_at = now()
  where order_id = p_order_id;

  -- Update user profile plan & reset/extend usage
  update public.profiles
  set plan = v_payment.plan,
      generations_used_this_month = 0,
      billing_period_start = date_trunc('month', now())::date,
      updated_at = now()
  where id = v_payment.user_id;

  return jsonb_build_object(
    'ok', true,
    'status', 'fulfilled',
    'plan', v_payment.plan,
    'credits', v_plan_limit
  );
end;
$$;

grant execute on function public.fulfill_payment_entitlement(text, text, text) to service_role, authenticated;
