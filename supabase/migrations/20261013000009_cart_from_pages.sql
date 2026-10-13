-- "Add to cart" on the home and sales pages: the cart needs each product's name and checkout link
-- next to its price. All of it is public information already shown on the pages (and the checkout
-- link is a public Lemon Squeezy URL), so the public price view now carries it too.
-- (Columns can only be added at the end of an existing view.)
create or replace view public.page_prices as
  select slug, price_cents, compare_at_cents, currency, price_ils_cents, compare_at_ils_cents,
         name, name_emphasis, checkout_url
  from public.products;

revoke all on public.page_prices from public;
grant select on public.page_prices to anon, authenticated;
