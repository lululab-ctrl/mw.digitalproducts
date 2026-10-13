-- Which language the person read and accepted the terms in, so their signed copy is in that language.
alter table public.beta_members
  add column if not exists terms_lang text not null default 'en' check (terms_lang in ('en', 'he'));
