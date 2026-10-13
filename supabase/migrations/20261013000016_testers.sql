-- Testers: people Matan approves to try the products before or around launch. At most 10 active at a time.
-- Approved in the shop admin (add_tester), they get MWP Presets, MWP Panel and the Field Guides as
-- downloads (stamped personal copies, like buyers), sign in on shop.mw.photography/testers/ with a
-- one-time link, and can be removed in one click (remove_tester). monday.com is told both times.
create table if not exists public.testers (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null unique references public.customers(id) on delete cascade,
  added_at    timestamptz not null default now(),
  removed_at  timestamptz
);
alter table public.testers enable row level security;
drop policy if exists "admin: read testers" on public.testers;
create policy "admin: read testers" on public.testers for select using (public.is_admin());

create or replace function public.tester_cap() returns integer
language sql immutable as $$ select 10 $$;

-- 10 active testers at most, checked in the database (two approvals at the same moment can't go over).
create or replace function public.enforce_tester_cap() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.removed_at is not null then return new; end if;
  perform pg_advisory_xact_lock(hashtext('tester_cap'));
  if (select count(*) from public.testers where removed_at is null and id <> new.id) >= public.tester_cap() then
    raise exception 'tester_program_full' using errcode = 'P0001';
  end if;
  return new;
end $$;
drop trigger if exists testers_cap on public.testers;
create trigger testers_cap before insert or update of removed_at on public.testers
  for each row execute function public.enforce_tester_cap();

create or replace function public.add_tester(p_email text, p_name text)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_email text := lower(trim(p_email));
  v_customer uuid;
  v_tester uuid;
begin
  if not coalesce(public.is_admin(), false) then raise exception 'admins only'; end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$' then raise exception 'invalid email'; end if;

  insert into public.customers (email, name) values (v_email, nullif(trim(p_name), ''))
  on conflict (email) do update set name = coalesce(public.customers.name, excluded.name)
  returning id into v_customer;

  insert into public.testers (customer_id) values (v_customer)
  on conflict (customer_id) do update set removed_at = null, added_at = now()
  returning id into v_tester;

  -- The three products as downloads (an ambassador's read-only guides become downloadable while they test).
  insert into public.entitlements (customer_id, product_id, view_only)
  select v_customer, p.id, false from public.products p
   where p.slug in ('mwp-presets', 'mwp-panel', 'mwp-field-guides')
  on conflict (customer_id, product_id) do update set revoked_at = null, view_only = false;

  begin
    perform public.call_scheduler('tester', jsonb_build_object('tester_id', v_tester, 'action', 'added'));
  exception when others then
    raise warning 'add_tester: monday / personal copies not requested: %', sqlerrm;
  end;
  return v_tester;
end $$;

create or replace function public.remove_tester(p_tester uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_customer uuid;
  v_ambassador boolean;
begin
  if not coalesce(public.is_admin(), false) then raise exception 'admins only'; end if;
  update public.testers set removed_at = now() where id = p_tester and removed_at is null
  returning customer_id into v_customer;
  if v_customer is null then return; end if;   -- unknown or already removed

  -- Take back the free access. Anything bought stays. An active ambassador keeps the program's access
  -- (with the guides read-only again).
  select exists (select 1 from public.beta_members where customer_id = v_customer and status = 'active') into v_ambassador;
  if v_ambassador then
    update public.entitlements e set view_only = true
      from public.products p
     where p.id = e.product_id and p.slug = 'mwp-field-guides' and e.customer_id = v_customer and e.order_id is null;
  else
    update public.entitlements e set revoked_at = now()
      from public.products p
     where p.id = e.product_id and p.slug in ('mwp-presets', 'mwp-panel', 'mwp-field-guides')
       and e.customer_id = v_customer and e.order_id is null and e.revoked_at is null;
  end if;

  begin
    perform public.call_scheduler('tester', jsonb_build_object('tester_id', p_tester, 'action', 'removed'));
  exception when others then
    raise warning 'remove_tester: monday update not sent: %', sqlerrm;
  end;
end $$;

revoke all on function public.add_tester(text, text) from public, anon;
revoke all on function public.remove_tester(uuid) from public, anon;
grant execute on function public.add_tester(text, text) to authenticated;   -- checked inside: admins only
grant execute on function public.remove_tester(uuid) to authenticated;
