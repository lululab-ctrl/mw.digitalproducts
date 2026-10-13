-- Supabase ↔ monday.com mirror (Matan, 13 Oct 2026): what's added to or deleted from the shop's people in Supabase
-- shows up in monday too.
--   * A customer added by hand in Supabase (table editor / SQL) → Shop Customers (if not there yet). The shop's
--     own flows already send their people to monday.
--   * A customer deleted → their rows on Shop Customers, Shop Ambassadors, Shop Testers, Shop Ambassador
--     Applications and Shop Feedback are deleted in monday (they go to monday's trash for 30 days).
--   * A login deleted (Supabase → Authentication → Users → Delete) → that person is removed from the shop too:
--     their applications and their customer record (with their ambassador / tester rows, free access and
--     feedback). Someone who has orders keeps their customer record, so purchase history is never lost.
-- The admin (admin_allowlist) is never removed this way.

create or replace function public.on_customer_added()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- Only people added by hand (Supabase dashboard / SQL). The shop's own flows (orders, accounts, ambassadors,
  -- testers) come through the API as 'authenticator' and already tell monday themselves.
  if session_user = 'authenticator' then return new; end if;
  perform public.call_scheduler('customer_added', jsonb_build_object('customer_id', new.id));
  return new;
exception when others then
  raise warning 'on_customer_added: monday not told: %', sqlerrm;
  return new;
end $$;
revoke all on function public.on_customer_added() from public, anon, authenticated;
drop trigger if exists customer_added_to_monday on public.customers;
create trigger customer_added_to_monday after insert on public.customers
  for each row execute function public.on_customer_added();

create or replace function public.on_customer_deleted()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform public.call_scheduler('customer_deleted', jsonb_build_object('email', lower(old.email)));
  return old;
exception when others then
  raise warning 'on_customer_deleted: monday not told: %', sqlerrm;
  return old;
end $$;
revoke all on function public.on_customer_deleted() from public, anon, authenticated;
drop trigger if exists customer_deleted_from_monday on public.customers;
create trigger customer_deleted_from_monday after delete on public.customers
  for each row execute function public.on_customer_deleted();

create or replace function public.on_auth_user_deleted()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_email text := lower(coalesce(old.email, ''));
begin
  if v_email = '' or exists (select 1 from public.admin_allowlist where email = v_email) then return old; end if;
  delete from public.ambassador_applications where lower(email) = v_email;
  delete from public.customers c
   where lower(c.email) = v_email
     and not exists (select 1 from public.orders o where o.customer_id = c.id);
  return old;
end $$;
revoke all on function public.on_auth_user_deleted() from public, anon, authenticated;
drop trigger if exists on_auth_user_deleted_cleanup on auth.users;
create trigger on_auth_user_deleted_cleanup after delete on auth.users
  for each row execute function public.on_auth_user_deleted();
