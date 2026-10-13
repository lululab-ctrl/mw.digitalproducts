-- Two more things go to monday.com automatically (through the scheduler function and Make):
--   * a new account, once its email is confirmed → Shop Customers (source: Account or Ambassador program)
--   * a buyer's first download of a product        → that order's Delivery = Downloaded (Shop Orders)
-- The calls are fire-and-forget (pg_net) and can never block a sign-in or a download.

create or replace function public.monday_new_account() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.email_confirmed_at is not null
     and (tg_op = 'INSERT' or old.email_confirmed_at is null) then
    begin
      perform public.call_scheduler('account', jsonb_build_object('user_id', new.id));
    exception when others then
      raise warning 'monday_new_account: %', sqlerrm;   -- never stop the sign-up
    end;
  end if;
  return new;
end $$;

drop trigger if exists on_auth_user_monday on auth.users;
create trigger on_auth_user_monday
  after insert or update of email_confirmed_at on auth.users
  for each row execute function public.monday_new_account();

create or replace function public.monday_first_download() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.downloads where entitlement_id = new.entitlement_id and id <> new.id) then
    begin
      perform public.call_scheduler('downloaded', jsonb_build_object('entitlement_id', new.entitlement_id));
    exception when others then
      raise warning 'monday_first_download: %', sqlerrm;  -- never stop the download
    end;
  end if;
  return new;
end $$;

drop trigger if exists on_first_download_monday on public.downloads;
create trigger on_first_download_monday
  after insert on public.downloads
  for each row execute function public.monday_first_download();
