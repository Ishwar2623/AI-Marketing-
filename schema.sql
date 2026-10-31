create extension if not exists pgcrypto;

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text,
  industry text,
  location text,
  website text,
  offer text,
  audience text,
  goal text,
  budget text,
  brand_tone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  status text default 'Draft',
  objective text,
  spend numeric default 0,
  leads integer default 0,
  cpl numeric,
  roas numeric,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text,
  phone text,
  email text,
  source text,
  status text default 'New',
  score integer default 0,
  value numeric,
  created_at timestamptz default now()
);

create table if not exists public.automations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text,
  trigger_type text,
  keyword text,
  status text default 'Draft',
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.businesses enable row level security;
alter table public.campaigns enable row level security;
alter table public.leads enable row level security;
alter table public.automations enable row level security;

create policy "business own" on public.businesses for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "campaign own" on public.campaigns for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "lead own" on public.leads for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "automation own" on public.automations for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
