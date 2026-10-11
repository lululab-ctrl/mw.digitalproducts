-- ============================================================================
-- MWP · 006 · Scheduled jobs and product sync
-- The database calls the `scheduler` Edge Function:
--   * after a product is added or changed      → job "product"  (mirrors it to monday)
--   * every hour                                → job "approvals" (Matan's approvals in monday → shop)
--   * Mondays 06:00 UTC (09:00 Israel)          → job "weekly_summary"
--   * the 1st of the month 06:30 UTC            → job "month_close" (Shop Payouts row)
-- Calls carry a random key that lives only in Supabase Vault (created below,
-- never in git). The function checks it with check_cron_key().
-- ============================================================================

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

-- Random key, generated inside the database on first run.
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'mwp_cron_key') then
    perform vault.create_secret(
      replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
      'mwp_cron_key',
      'Authenticates database calls to the scheduler Edge Function');
  end if;
end $$;

create or replace function public.check_cron_key(p_key text)
returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from vault.decrypted_secrets
    where name = 'mwp_cron_key' and decrypted_secret = p_key
  );
$$;
revoke all on function public.check_cron_key(text) from public, anon, authenticated;
grant execute on function public.check_cron_key(text) to service_role;

-- Fire-and-forget call to the scheduler function.
create or replace function public.call_scheduler(p_job text, p_payload jsonb default '{}'::jsonb)
returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_key text;
begin
  select decrypted_secret into v_key from vault.decrypted_secrets where name = 'mwp_cron_key';
  perform net.http_post(
    url     := 'https://tkkpxsyioetzexgbmbqy.supabase.co/functions/v1/scheduler',
    headers := jsonb_build_object('content-type', 'application/json', 'x-cron-key', v_key),
    body    := jsonb_build_object('job', p_job) || coalesce(p_payload, '{}'::jsonb),
    timeout_milliseconds := 10000
  );
end $$;
revoke all on function public.call_scheduler(text, jsonb) from public, anon, authenticated;

-- One-time tokens for Make's call back with Matan's approvals.
create table public.sync_nonces (
  nonce      text primary key,
  purpose    text not null,
  created_at timestamptz not null default now(),
  used_at    timestamptz
);
alter table public.sync_nonces enable row level security;  -- no policies: service role only

-- Mirror product changes to monday (only when something visible changed).
create or replace function public.on_product_changed()
returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and (to_jsonb(new) - 'updated_at' - 'sort_order') = (to_jsonb(old) - 'updated_at' - 'sort_order') then
    return new;
  end if;
  perform public.call_scheduler('product', jsonb_build_object('id', new.id));
  return new;
end $$;
revoke all on function public.on_product_changed() from public, anon, authenticated;

create trigger product_changed_to_monday
  after insert or update on public.products
  for each row execute function public.on_product_changed();

-- Schedules (UTC). Re-running this migration replaces them.
select cron.schedule('mwp-approvals',      '7 * * * *',  $$ select public.call_scheduler('approvals') $$);
select cron.schedule('mwp-weekly-summary', '0 6 * * 1',  $$ select public.call_scheduler('weekly_summary') $$);
select cron.schedule('mwp-month-close',    '30 6 1 * *', $$ select public.call_scheduler('month_close') $$);
select cron.schedule('mwp-clean-nonces',   '15 3 * * *', $$ delete from public.sync_nonces where created_at < now() - interval '2 days' $$);

-- Confirms the wiring right after deploy: Make receives a "ping" event.
select public.call_scheduler('ping');
