-- ============================================================================
-- MWP Presets · 001 · Core schema
-- Run in Supabase → SQL Editor (or `supabase db push`). Safe to run once on a
-- fresh project. Money is stored in cents; emails are stored lower-case.
-- ============================================================================

create extension if not exists pgcrypto;

-- Keeps updated_at current on any table that has it
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ---------------------------------------------------------------- admins
-- A row here makes a signed-in Supabase user an administrator.
create table public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- products
create table public.products (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name                text not null,                      -- e.g. "Savanna Light"
  name_emphasis       text,                               -- bold half of the title, e.g. "Collection"
  tagline             text,                               -- one line under the title
  description         text,                               -- plain paragraphs, separated by blank lines
  badge               text,                               -- "New", "Bestseller"
  price_cents         integer not null check (price_cents >= 0),
  compare_at_cents    integer check (compare_at_cents is null or compare_at_cents > price_cents),
  currency            text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  preset_count        integer check (preset_count > 0),
  includes            text[] not null default '{}',       -- bullet list on the product page
  compatibility       text[] not null default '{}',       -- "Lightroom Classic", "Photoshop (Camera Raw)"
  checkout_url        text,                               -- Lemon Squeezy checkout link for this variant
  checkout_variant_id text unique,                        -- matches first_order_item.variant_id in webhooks
  version             text not null default '1.0',
  cover_path          text,                               -- image in public 'product-media' bucket
  hover_path          text,                               -- second image shown on card hover
  is_active           boolean not null default false,     -- drafts stay hidden until approved
  is_featured         boolean not null default false,
  sort_order          integer not null default 100,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();
create index products_listing_idx on public.products (is_active, sort_order);

-- Where the paid .zip lives. Separate table so visitors can never read the path.
create table public.product_files (
  product_id  uuid primary key references public.products(id) on delete cascade,
  path        text not null,                 -- path inside the private 'presets' bucket
  size_bytes  bigint,
  version     text not null default '1.0',
  uploaded_at timestamptz not null default now()
);

-- Before/after pairs and gallery images for a product
create table public.product_media (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  kind        text not null check (kind in ('before', 'after', 'gallery')),
  pair_key    text,                 -- same key on a 'before' and its 'after'
  path        text not null,        -- path in public 'product-media' bucket
  alt         text not null default '',
  caption     text,                 -- "Kingfisher · Forest shade"
  width       integer,
  height      integer,
  sort_order  integer not null default 100,
  created_at  timestamptz not null default now()
);
create index product_media_product_idx on public.product_media (product_id, sort_order);

-- ---------------------------------------------------------------- customers
create table public.customers (
  id               uuid primary key default gen_random_uuid(),
  auth_user_id     uuid unique references auth.users(id) on delete set null,
  email            text not null unique check (email = lower(email)),
  name             text,
  country          text,
  marketing_opt_in boolean not null default false,
  monday_item_id   text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create trigger customers_touch before update on public.customers
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- orders
create table public.orders (
  id                uuid primary key default gen_random_uuid(),
  checkout_order_id text not null unique,
  order_number      text,                        -- human-readable number from the checkout
  customer_id       uuid not null references public.customers(id),
  subtotal_cents    integer not null default 0,
  tax_cents         integer not null default 0,
  total_cents       integer not null,
  currency          text not null,
  status            text not null check (status in ('paid', 'refunded', 'partially_refunded')),
  discount_code     text,
  source            text,                        -- utm_source captured at checkout
  monday_item_id    text,
  created_at        timestamptz not null default now(),
  refunded_at       timestamptz
);
create index orders_customer_idx on public.orders (customer_id);
create index orders_created_idx on public.orders (created_at desc);

create table public.order_items (
  order_id    uuid not null references public.orders(id) on delete cascade,
  product_id  uuid not null references public.products(id),
  price_cents integer not null,
  primary key (order_id, product_id)
);

-- ---------------------------------------------------------------- entitlements
-- One row = this customer may download this product. Revoked on refund.
create table public.entitlements (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  product_id  uuid not null references public.products(id),
  order_id    uuid references public.orders(id) on delete set null,
  granted_at  timestamptz not null default now(),
  revoked_at  timestamptz,
  unique (customer_id, product_id)
);

create table public.downloads (
  id             bigint generated always as identity primary key,
  entitlement_id uuid not null references public.entitlements(id) on delete cascade,
  ip_hash        text,
  user_agent     text,
  created_at     timestamptz not null default now()
);
create index downloads_entitlement_idx on public.downloads (entitlement_id, created_at desc);

-- ---------------------------------------------------------------- support
create table public.support_tickets (
  id             uuid primary key default gen_random_uuid(),
  email          text not null check (email = lower(email)),
  name           text,
  category       text not null default 'other'
                 check (category in ('download', 'install', 'refund', 'other')),
  subject        text not null,
  message        text not null,
  order_number   text,
  status         text not null default 'new' check (status in ('new', 'waiting', 'resolved')),
  monday_item_id text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create trigger support_touch before update on public.support_tickets
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- email list
create table public.subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique check (email = lower(email)),
  source     text not null default 'free-sampler',
  consent    boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- webhooks
create table public.webhook_events (
  event_id     text primary key,
  provider     text not null,
  payload      jsonb not null,
  processed_at timestamptz not null default now()
);
