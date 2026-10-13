-- Fix: My downloads showed "Nothing on this email yet" to new buyers and beta members.
-- The library only matched customers already linked to a login (auth_user_id), but that link was
-- only made on the first download, which needs the library first. Now a signed-in person also sees
-- the customer record whose email matches their verified sign-in email, and the link is made the
-- moment they sign in.
drop policy if exists "customer: own row" on public.customers;
create policy "customer: own row" on public.customers
  for select using (
    public.is_admin()
    or auth_user_id = auth.uid()
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

drop policy if exists "customer: own entitlements" on public.entitlements;
create policy "customer: own entitlements" on public.entitlements
  for select using (
    public.is_admin()
    or customer_id in (
      select id from public.customers
      where auth_user_id = auth.uid() or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

drop policy if exists "customer: own orders" on public.orders;
create policy "customer: own orders" on public.orders
  for select using (
    public.is_admin()
    or customer_id in (
      select id from public.customers
      where auth_user_id = auth.uid() or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

-- Link a login to its customer record as soon as the email is confirmed (sign-in link or code).
create or replace function public.link_customer_login() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.email is not null and new.email_confirmed_at is not null then
    update public.customers set auth_user_id = new.id
    where lower(email) = lower(new.email) and auth_user_id is null;
  end if;
  return new;
end $$;

drop trigger if exists on_auth_user_link_customer on auth.users;
create trigger on_auth_user_link_customer
  after insert or update of email_confirmed_at, last_sign_in_at on auth.users
  for each row execute function public.link_customer_login();

-- Link everyone who already signed in.
update public.customers c set auth_user_id = u.id
from auth.users u
where c.auth_user_id is null and u.email_confirmed_at is not null and lower(u.email) = lower(c.email);
