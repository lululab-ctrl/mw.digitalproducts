-- Limits for the public forms (free sampler sign-up, support), so a script can't flood them:
-- every request is counted here by salted IP hash and email hash. Only the server functions
-- (service role) use this table; nobody else can read or write it.
create table public.form_attempts (
  id         bigint generated always as identity primary key,
  form       text not null,
  ip_hash    text,
  email_hash text,
  created_at timestamptz not null default now()
);
create index form_attempts_ip_idx on public.form_attempts (form, ip_hash, created_at desc);
create index form_attempts_email_idx on public.form_attempts (form, email_hash, created_at desc);
alter table public.form_attempts enable row level security;
revoke all on public.form_attempts from anon, authenticated;
