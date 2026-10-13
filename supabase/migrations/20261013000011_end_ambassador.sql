-- Ending an ambassadorship from the shop admin. Matan's terms (section 7):
--   ended             → the licence stays with them for life (nothing is removed)
--   ended for breach  → access is removed (only the free ambassador access; anything they bought stays)
-- Either way monday.com's Shop Ambassadors row is updated automatically (scheduler → Make).
alter table public.beta_members
  add column if not exists status   text not null default 'active' check (status in ('active', 'ended', 'ended_breach')),
  add column if not exists ended_at timestamptz;

create or replace function public.end_ambassador(p_member uuid, p_breach boolean)
returns text
language plpgsql security definer set search_path = public as $$
declare
  v_customer uuid;
  v_status text;
begin
  if not coalesce(public.is_admin(), false) then raise exception 'admins only'; end if;
  select customer_id, status into v_customer, v_status from public.beta_members where id = p_member for update;
  if v_customer is null then raise exception 'unknown member'; end if;
  if v_status <> 'active' then return v_status; end if;   -- already ended: nothing to do

  update public.beta_members
     set status = case when p_breach then 'ended_breach' else 'ended' end, ended_at = now()
   where id = p_member;

  if p_breach then
    -- Only the free access from the program (no order behind it). Purchases are untouched.
    update public.entitlements set revoked_at = now()
     where customer_id = v_customer and order_id is null and revoked_at is null;
  end if;

  begin
    perform public.call_scheduler('ambassador_status', jsonb_build_object('member_id', p_member));
  exception when others then
    raise warning 'end_ambassador: monday update not sent: %', sqlerrm;
  end;
  return case when p_breach then 'ended_breach' else 'ended' end;
end $$;

revoke all on function public.end_ambassador(uuid, boolean) from public, anon;
grant execute on function public.end_ambassador(uuid, boolean) to authenticated;   -- checked inside: admins only
