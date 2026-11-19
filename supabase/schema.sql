-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run
create table if not exists public.conversions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  category_id text not null,
  from_unit text not null,
  to_unit text not null,
  amount text not null,
  result text not null,
  bookmarked boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.conversions enable row level security;

create policy "read own conversions" on public.conversions for select using (auth.uid() = user_id);
create policy "add own conversions" on public.conversions for insert with check (auth.uid() = user_id);
create policy "update own conversions" on public.conversions for update using (auth.uid() = user_id);
create policy "delete own conversions" on public.conversions for delete using (auth.uid() = user_id);
