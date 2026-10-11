-- Prices shown on the home and sales pages, editable in the admin.
-- Shekel prices are what the Hebrew pages show; dollar prices are what the English pages show.
alter table public.products
  add column if not exists price_ils_cents integer check (price_ils_cents is null or price_ils_cents >= 0),
  add column if not exists compare_at_ils_cents integer check (compare_at_ils_cents is null or compare_at_ils_cents >= 0);

-- Public, read-only list of page prices by slug. Only price columns are exposed, so a product's
-- price can be set and shown on the sales pages before the product itself goes live in the shop.
create or replace view public.page_prices as
  select slug, price_cents, compare_at_cents, currency, price_ils_cents, compare_at_ils_cents
  from public.products;

revoke all on public.page_prices from public;
grant select on public.page_prices to anon, authenticated;
