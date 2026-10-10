-- ============================================================================
-- MWP · 005 · Admin allowlist
-- Emails listed here become admins automatically the first time they sign in
-- (and right away if they already have a login). No SQL needed per person.
-- To add or remove an admin later: insert into / delete from admin_allowlist,
-- and for removal also delete their row from admins.
-- ============================================================================

create table public.admin_allowlist (
  email      text primary key check (email = lower(email)),
  added_at   timestamptz not null default now()
);
alter table public.admin_allowlist enable row level security;
create policy "admin: read allowlist" on public.admin_allowlist
  for select using (public.is_admin());

insert into public.admin_allowlist (email) values
  ('contact@matanwildphotography.com'),
  ('jlouise@matanwildphotography.com')
on conflict do nothing;

-- Promote a login to admin when its email is on the allowlist
create or replace function public.grant_admin_if_allowlisted()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.email is not null and exists (
    select 1 from public.admin_allowlist where email = lower(new.email)
  ) then
    insert into public.admins (user_id, email)
    values (new.id, lower(new.email))
    on conflict (user_id) do nothing;
  end if;
  return new;
end $$;
revoke all on function public.grant_admin_if_allowlisted() from public, anon, authenticated;

create trigger on_auth_user_admin_allowlist
  after insert or update of email on auth.users
  for each row execute function public.grant_admin_if_allowlisted();

-- Logins that already exist
insert into public.admins (user_id, email)
select u.id, lower(u.email)
from auth.users u
join public.admin_allowlist a on a.email = lower(u.email)
on conflict (user_id) do nothing;
