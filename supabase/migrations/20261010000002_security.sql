-- ============================================================================
-- MWP Presets · 002 · Row level security, admin role, storage buckets
-- Principle: everything is closed; open only what a page needs.
--   anon (visitors)      → active products and their media
--   signed-in customers  → their own customer row, orders, entitlements
--   admins               → everything, via is_admin()
--   Edge Functions       → service role key, bypasses RLS
-- ============================================================================

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------- enable RLS
alter table public.admins          enable row level security;
alter table public.products        enable row level security;
alter table public.product_media   enable row level security;
alter table public.product_files   enable row level security;
alter table public.customers       enable row level security;
alter table public.orders          enable row level security;
alter table public.order_items     enable row level security;
alter table public.entitlements    enable row level security;
alter table public.downloads       enable row level security;
alter table public.support_tickets enable row level security;
alter table public.subscribers     enable row level security;
alter table public.webhook_events  enable row level security;

-- ---------------------------------------------------------------- public catalogue
create policy "catalogue: read active products" on public.products
  for select using (is_active or public.is_admin());
create policy "catalogue: read media of active products" on public.product_media
  for select using (
    public.is_admin()
    or exists (select 1 from public.products p where p.id = product_id and p.is_active)
  );

-- product_files has no visitor or customer policy: only admins and the
-- service role (Edge Functions) can see where paid files live.
create policy "admin: manage product files" on public.product_files
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------- customers see their own
create policy "customer: own row" on public.customers
  for select using (auth_user_id = auth.uid() or public.is_admin());
create policy "customer: own orders" on public.orders
  for select using (
    public.is_admin()
    or customer_id in (select id from public.customers where auth_user_id = auth.uid())
  );
create policy "customer: own order items" on public.order_items
  for select using (
    public.is_admin()
    or order_id in (
      select o.id from public.orders o
      join public.customers c on c.id = o.customer_id
      where c.auth_user_id = auth.uid())
  );
create policy "customer: own entitlements" on public.entitlements
  for select using (
    public.is_admin()
    or customer_id in (select id from public.customers where auth_user_id = auth.uid())
  );

-- ---------------------------------------------------------------- admin writes
create policy "admin: manage products" on public.products
  for all using (public.is_admin()) with check (public.is_admin());
create policy "admin: manage media" on public.product_media
  for all using (public.is_admin()) with check (public.is_admin());
create policy "admin: read admins" on public.admins
  for select using (public.is_admin());
create policy "admin: read downloads" on public.downloads
  for select using (public.is_admin());
create policy "admin: manage tickets" on public.support_tickets
  for all using (public.is_admin()) with check (public.is_admin());
create policy "admin: read subscribers" on public.subscribers
  for select using (public.is_admin());
create policy "admin: update customers" on public.customers
  for update using (public.is_admin()) with check (public.is_admin());
create policy "admin: revoke or restore access" on public.entitlements
  for update using (public.is_admin()) with check (public.is_admin());
-- Orders are written only by the payment webhook (service role). Admins read them
-- through the customer policy above; refunds happen in the checkout dashboard.

-- ---------------------------------------------------------------- storage
-- presets        : private. Paid .zip files. Only admins upload; customers get
--                  5-minute signed links from the get-download function.
-- product-media  : public read. Covers, before/after images, gallery.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('presets', 'presets', false, 524288000, array['application/zip', 'application/x-zip-compressed']),
  ('product-media', 'product-media', true, 15728640, array['image/webp', 'image/jpeg', 'image/png', 'image/avif'])
on conflict (id) do nothing;

create policy "media: public read" on storage.objects
  for select using (bucket_id = 'product-media');
create policy "media: admin write" on storage.objects
  for insert with check (bucket_id = 'product-media' and public.is_admin());
create policy "media: admin update" on storage.objects
  for update using (bucket_id = 'product-media' and public.is_admin());
create policy "media: admin delete" on storage.objects
  for delete using (bucket_id = 'product-media' and public.is_admin());

create policy "presets: admin read" on storage.objects
  for select using (bucket_id = 'presets' and public.is_admin());
create policy "presets: admin write" on storage.objects
  for insert with check (bucket_id = 'presets' and public.is_admin());
create policy "presets: admin update" on storage.objects
  for update using (bucket_id = 'presets' and public.is_admin());
-- No delete policy on 'presets': old versions stay so past buyers are never cut off
-- by mistake. Remove files from the Supabase dashboard if you really need to.
