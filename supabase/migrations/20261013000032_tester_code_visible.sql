-- The tester code is shown to the admin (Matan, 13 Oct 2026): it's kept as written, readable by admins
-- only (row level security); the tester function still checks it through its fingerprint.
-- Testers join with the code by themselves; there's no approval step in the admin any more.
alter table public.tester_code add column if not exists code text;
drop policy if exists "admin: read tester code" on public.tester_code;
create policy "admin: read tester code" on public.tester_code for select using (public.is_admin());

create or replace function public.set_tester_code(p_code text)
returns void
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_code text := upper(trim(coalesce(p_code, '')));
begin
  if not coalesce(public.is_admin(), false) then raise exception 'admins only'; end if;
  if length(v_code) < 6 then raise exception 'The code needs at least 6 characters.'; end if;
  insert into public.tester_code (id, code, code_hash) values (true, v_code, encode(digest(v_code, 'sha256'), 'hex'))
  on conflict (id) do update set code = excluded.code, code_hash = excluded.code_hash, updated_at = now();
end $$;
