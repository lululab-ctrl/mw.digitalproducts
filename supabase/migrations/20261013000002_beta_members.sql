-- Beta members: invited photographers who get MWP Presets, MWP Panel and the Field Guides free in
-- exchange for content (stories, reels, posts tagging @mw_phototours). Access works exactly like a
-- purchase: entitlements tied to their email, downloads from My downloads, Panel licence by email
-- sign-in. Revoking a member's entitlements in the admin ends their access.
create table public.beta_members (
  id           uuid primary key default gen_random_uuid(),
  customer_id  uuid not null unique references public.customers(id) on delete cascade,
  instagram    text check (length(instagram) <= 60),
  agreed_at    timestamptz not null default now(),
  ip_hash      text,
  created_at   timestamptz not null default now()
);

-- Wrong-password attempts, to slow down guessing (per salted IP hash).
create table public.beta_attempts (
  id         bigint generated always as identity primary key,
  ip_hash    text,
  created_at timestamptz not null default now()
);
create index beta_attempts_ip_idx on public.beta_attempts (ip_hash, created_at desc);

alter table public.beta_members enable row level security;
alter table public.beta_attempts enable row level security;
create policy "admin: read beta members" on public.beta_members for select using (public.is_admin());
