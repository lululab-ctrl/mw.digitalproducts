-- Personal copies: each buyer's (and beta member's) Presets and Field Guides download is made for
-- them, with their name, email and licence ID on every PDF page and inside every preset and LUT
-- file. The base files stay in presets/<slug>/...; personal copies go to presets/personal/<entitlement>/.
-- They're made by the "Personal copies" GitHub workflow (tools/personalize/).
create table public.personal_files (
  entitlement_id uuid primary key references public.entitlements(id) on delete cascade,
  path           text not null,
  version        text not null,
  size_bytes     bigint,
  created_at     timestamptz not null default now()
);
alter table public.personal_files enable row level security;
create policy "admin: read personal files" on public.personal_files for select using (public.is_admin());
