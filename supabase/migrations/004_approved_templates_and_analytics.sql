-- Setup Approved Templates Cache table
create table if not exists public.approved_templates (
  id uuid primary key default gen_random_uuid(),
  prompt text not null,
  template_name text not null, -- e.g. "Luxury Reveal", "SaaS Promo"
  color_palette text not null,
  storyboard jsonb not null default '[]'::jsonb,
  code text not null,
  auditor_score integer not null,
  created_at timestamptz not null default now()
);

-- Enable RLS for approved_templates
alter table public.approved_templates enable row level security;

create policy "Anyone can read approved templates"
  on public.approved_templates
  for select
  to authenticated, anon
  using (true);

create policy "Authenticated users can insert approved templates"
  on public.approved_templates
  for insert
  to authenticated
  with check (true);

-- Setup Generation Analytics table
create table if not exists public.generation_analytics (
  id uuid primary key default gen_random_uuid(),
  prompt text not null,
  template text not null,
  color_palette text not null,
  auditor_score integer not null default 0,
  compile_score integer not null default 0, -- 100 if compiled successfully, 0 otherwise
  refinement_count integer not null default 0,
  generation_duration_ms integer not null default 0,
  render_duration_ms integer not null default 0,
  success_rate numeric not null default 0.0, -- overall score representation (0.0 to 1.0)
  failure_cause text,
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

-- Enable RLS for generation_analytics
alter table public.generation_analytics enable row level security;

create policy "Users can read own generation analytics"
  on public.generation_analytics
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Any user can insert analytics"
  on public.generation_analytics
  for insert
  to authenticated, anon
  with check (true);
