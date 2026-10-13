-- The Ambassador Program takes 26 people at most. Enforced here, in the database, so two people
-- joining at the same moment can't go over. A member joining again (same customer) doesn't take
-- a new place. To change the number, replace ambassador_cap() in a new migration.
create or replace function public.ambassador_cap() returns integer
language sql immutable as $$ select 26 $$;

create or replace function public.enforce_ambassador_cap() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform pg_advisory_xact_lock(hashtext('ambassador_cap'));   -- one join at a time while counting
  if exists (select 1 from public.beta_members where customer_id = new.customer_id) then
    return new;                                                 -- already a member: joining again
  end if;
  if (select count(*) from public.beta_members) >= public.ambassador_cap() then
    raise exception 'ambassador_program_full' using errcode = 'P0001';
  end if;
  return new;
end $$;

drop trigger if exists beta_members_cap on public.beta_members;
create trigger beta_members_cap before insert on public.beta_members
  for each row execute function public.enforce_ambassador_cap();

-- Is the program still taking people? (Used by the page; reveals only open / full.)
create or replace function public.ambassador_program_open() returns boolean
language sql stable security definer set search_path = public as $$
  select (select count(*) from public.beta_members) < public.ambassador_cap()
$$;
revoke all on function public.ambassador_program_open() from public;
grant execute on function public.ambassador_program_open() to service_role;
