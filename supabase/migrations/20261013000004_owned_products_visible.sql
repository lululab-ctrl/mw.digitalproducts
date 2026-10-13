-- Fix: My downloads failed with "Cannot read properties of null (reading 'cover_path')".
-- Products that aren't live in the shop yet (all of them, before launch) were hidden from everyone
-- but admins, so a beta member's library rows came back without their product. People can now
-- always see the products they own, live or not.
create policy "customer: products they own" on public.products
  for select using (
    id in (
      select e.product_id from public.entitlements e
      join public.customers c on c.id = e.customer_id
      where e.revoked_at is null
        and (c.auth_user_id = auth.uid() or lower(c.email) = lower(coalesce(auth.jwt() ->> 'email', '')))
    )
  );
