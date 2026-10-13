-- 1. Ambassadors read the Field Guides online only: their free Field Guides entitlement is "view only".
--    get-download refuses it; guide-view shows the pages online, with their name drawn across each page.
--    Buying the guides (on their own or in a bundle) turns it into a normal, downloadable entitlement.
alter table public.entitlements
  add column if not exists view_only boolean not null default false;

update public.entitlements e
   set view_only = true
  from public.products p, public.beta_members b
 where p.id = e.product_id and p.slug = 'mwp-field-guides'
   and b.customer_id = e.customer_id
   and e.order_id is null;

-- The online pages of the Field Guides, rendered once per version by the "Personal copies" worker:
--   guides: [{ "title": "…", "pages": ["views/<product>/<version>/1-001.jpg", …] }, …]
-- They're stored privately; guide-view hands each reader short-lived links, and the reader draws the
-- person's name, email and licence ID across every page.
create table if not exists public.guide_views (
  product_id uuid primary key references public.products(id) on delete cascade,
  version    text not null,
  guides     jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.guide_views enable row level security;
drop policy if exists "admin: read guide views" on public.guide_views;
create policy "admin: read guide views" on public.guide_views for select using (public.is_admin());

-- 2. The ambassador's own copy of the signed terms: the join answers with a one-time receipt (only its
--    hash is kept) so the page can download the PDF as soon as it's made, before email confirmation.
alter table public.beta_members
  add column if not exists receipt_hash      text,
  add column if not exists terms_pdf_made_at timestamptz;
