-- FLIPR premium: run this once in Supabase -> SQL Editor (after schema.sql).
-- Free accounts get 3 downloads. A paid plan gives unlimited downloads until it ends.
-- Users can READ their own rows but can never write them: only the functions below and the payment webhook can.

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text check (plan in ('monthly', 'yearly')),
  status text not null default 'inactive',
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.download_usage (
  user_id uuid primary key references auth.users(id) on delete cascade,
  used int not null default 0
);

-- one row per successful payment, so a repeated webhook can never add time twice
create table if not exists public.payments (
  reference text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null,
  amount int not null,
  currency text not null,
  created_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;
alter table public.download_usage enable row level security;
alter table public.payments enable row level security;

drop policy if exists "read own subscription" on public.subscriptions;
create policy "read own subscription" on public.subscriptions for select using (auth.uid() = user_id);
drop policy if exists "read own usage" on public.download_usage;
create policy "read own usage" on public.download_usage for select using (auth.uid() = user_id);

-- What the app shows: premium or not, how many free downloads are used
create or replace function public.download_status()
returns json language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); s record; u int;
begin
  if uid is null then return json_build_object('premium', false, 'used', 0, 'limit', 3, 'until', null); end if;
  select * into s from subscriptions where user_id = uid;
  select used into u from download_usage where user_id = uid;
  return json_build_object(
    'premium', coalesce(s.status = 'active' and s.current_period_end > now(), false),
    'used', coalesce(u, 0), 'limit', 3,
    'until', case when s.status = 'active' and s.current_period_end > now() then s.current_period_end else null end
  );
end $$;

-- Called when someone taps a download button: uses up one free download, or lets premium users through
create or replace function public.consume_download()
returns json language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); is_premium boolean; u int;
begin
  if uid is null then return json_build_object('allowed', false, 'reason', 'login'); end if;
  select coalesce(status = 'active' and current_period_end > now(), false) into is_premium from subscriptions where user_id = uid;
  if coalesce(is_premium, false) then
    return json_build_object('allowed', true, 'premium', true, 'used', 0, 'limit', 3);
  end if;
  insert into download_usage (user_id, used) values (uid, 0) on conflict (user_id) do nothing;
  update download_usage set used = used + 1 where user_id = uid and used < 3 returning used into u;
  if u is null then
    select used into u from download_usage where user_id = uid;
    return json_build_object('allowed', false, 'reason', 'limit', 'used', u, 'limit', 3);
  end if;
  return json_build_object('allowed', true, 'premium', false, 'used', u, 'limit', 3);
end $$;

grant execute on function public.download_status() to authenticated;
grant execute on function public.consume_download() to authenticated;
