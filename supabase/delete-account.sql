-- FLIPR "Delete my account": run this once in Supabase -> SQL Editor.
-- A signed-in user can only ever delete THEIR OWN account (it uses auth.uid()).
-- Deleting the account also deletes their saved history, free-download count and plan records,
-- because those tables are linked to the account with "on delete cascade".

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
