alter table public.generation_analytics
  add column if not exists generation_mode text
    check (generation_mode in ('ad', 'motion_asset')),
  add column if not exists fps integer,
  add column if not exists duration_in_frames integer,
  add column if not exists loop boolean;
