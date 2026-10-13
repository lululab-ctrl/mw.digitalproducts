-- The beta page is now the MWP Ambassador Program: no password, members accept Matan's
-- Ambassador Program terms on the page. We keep which version of the terms they accepted.
-- beta_attempts now counts sign-ups per IP (to limit abuse) instead of wrong passwords.
alter table public.beta_members add column if not exists terms_version text;
comment on table public.beta_members is
  'MWP Ambassador Program members: free MWP Presets, Panel and Field Guides for content and feedback. Panel limited to 2 computers.';
