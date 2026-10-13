-- MWP Panel licences: the plugin works only for the person who bought it.
-- The buyer signs in to the plugin with the email they bought with (a one-time code sent to that
-- inbox), and each computer they use is registered here. Personal use on more than one computer is
-- fine; the number of computers at once is capped (PANEL_MAX_DEVICES in the license function), and
-- the buyer can remove an old computer from My downloads. A refund revokes the entitlement, and with
-- it every computer.
create table public.license_devices (
  id              uuid primary key default gen_random_uuid(),
  entitlement_id  uuid not null references public.entitlements(id) on delete cascade,
  device_id       text not null check (length(device_id) between 8 and 80),
  device_name     text check (length(device_name) <= 80),
  ip_hash         text,
  created_at      timestamptz not null default now(),
  last_seen_at    timestamptz not null default now(),
  unique (entitlement_id, device_id)
);
create index license_devices_entitlement_idx on public.license_devices (entitlement_id);

-- Only the license function (service role) and admins touch this table.
alter table public.license_devices enable row level security;
create policy "admin: read licence devices" on public.license_devices
  for select using (public.is_admin());
