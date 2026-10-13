-- Terms after approval (Matan, 13 Oct 2026): people apply first (questionnaire only). When the team approves
-- them in monday, they get a welcome email with a personal link; on that page they read and accept the terms,
-- and only then become ambassadors and get their tools.
--   status: new → approved (waiting for them to accept the terms) → accepted; or declined / full.
alter table public.ambassador_applications alter column terms_version drop not null;
alter table public.ambassador_applications alter column agreed_at drop not null;
alter table public.ambassador_applications alter column agreed_at drop default;
alter table public.ambassador_applications add column if not exists accept_token_hash text unique;
alter table public.ambassador_applications add column if not exists accepted_at timestamptz;
alter table public.ambassador_applications drop constraint if exists ambassador_applications_status_check;
alter table public.ambassador_applications add constraint ambassador_applications_status_check
  check (status in ('new', 'approved', 'accepted', 'declined', 'full'));
