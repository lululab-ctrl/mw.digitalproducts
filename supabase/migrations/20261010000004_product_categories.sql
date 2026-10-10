-- ============================================================================
-- MWP Shop · 004 · Product categories
-- The shop now sells more than presets: plugins, guides (PDFs), bundles.
--   category   : which shelf a product sits on
--   item_count : how many items it contains (presets, pages, products…);
--                the unit shown on the site comes from the category
-- ============================================================================

alter table public.products
  add column category text not null default 'preset'
  check (category in ('preset', 'plugin', 'guide', 'bundle', 'other'));

alter table public.products rename column preset_count to item_count;

create index products_category_idx on public.products (category) where is_active;
