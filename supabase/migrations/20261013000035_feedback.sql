-- Feedback from ambassadors and testers (Matan, 13 Oct 2026): bug reports, recommendations, reports, sent from
-- My downloads. Kept here and sent to monday.com (Shop Feedback) through Make.
create table if not exists public.feedback (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  from_role   text not null check (from_role in ('ambassador', 'tester', 'ambassador and tester')),
  kind        text not null check (kind in ('Bug', 'Recommendation', 'Report', 'Other')),
  product     text not null,
  message     text not null,
  setup       text
);
create index if not exists feedback_customer_day on public.feedback (customer_id, created_at desc);
alter table public.feedback enable row level security;
drop policy if exists "admin: read feedback" on public.feedback;
create policy "admin: read feedback" on public.feedback for select using (public.is_admin());
