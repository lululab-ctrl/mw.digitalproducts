-- My details: signed-in customers keep their name, phone and address up to date (My downloads → My details).
--
-- Customers never write to the table directly. Two functions do it for them, only for their own record,
-- and only once their email is confirmed:
--   my_profile()        their details (the record is created for someone who hasn't bought yet, and linked
--                       to their login); the name falls back to the one given at sign-up
--   save_my_profile()   saves them
-- The email isn't editable here: purchases are tied to it, so changing it goes through support.

alter table public.customers
  add column if not exists phone         text check (length(phone) <= 40),
  add column if not exists address_line1 text check (length(address_line1) <= 120),
  add column if not exists address_line2 text check (length(address_line2) <= 120),
  add column if not exists city          text check (length(city) <= 80),
  add column if not exists region        text check (length(region) <= 80),
  add column if not exists postal_code   text check (length(postal_code) <= 20);

create or replace function public.my_profile()
returns table (
  email text, name text, phone text, address_line1 text, address_line2 text,
  city text, region text, postal_code text, country text
)
language plpgsql security definer set search_path = public, auth as $$
#variable_conflict use_column
declare
  v_email text;
  v_name  text;
begin
  select lower(u.email), nullif(btrim(u.raw_user_meta_data ->> 'name'), '')
    into v_email, v_name
  from auth.users u
  where u.id = auth.uid() and u.email_confirmed_at is not null;
  if v_email is null then
    raise exception 'Please confirm your email first.' using errcode = '42501';
  end if;

  insert into public.customers (email, name, auth_user_id)
  values (v_email, v_name, auth.uid())
  on conflict on constraint customers_email_key do update
    set auth_user_id = auth.uid()
    where public.customers.auth_user_id is null or public.customers.auth_user_id = auth.uid();

  return query
    select c.email, coalesce(c.name, v_name), c.phone, c.address_line1, c.address_line2,
           c.city, c.region, c.postal_code, c.country
    from public.customers c
    where lower(c.email) = v_email and (c.auth_user_id is null or c.auth_user_id = auth.uid());
end $$;

create or replace function public.save_my_profile(
  p_name text, p_phone text, p_address_line1 text, p_address_line2 text,
  p_city text, p_region text, p_postal_code text, p_country text
)
returns void
language plpgsql security definer set search_path = public, auth as $$
declare
  v_email text;
  clean text[] := array[p_name, p_phone, p_address_line1, p_address_line2, p_city, p_region, p_postal_code, p_country];
begin
  select lower(u.email) into v_email
  from auth.users u
  where u.id = auth.uid() and u.email_confirmed_at is not null;
  if v_email is null then
    raise exception 'Please sign in first.' using errcode = '42501';
  end if;
  if length(p_name) > 120 or length(p_country) > 80 then
    raise exception 'One of the fields is too long.' using errcode = '22001';
  end if;
  -- Surrounding spaces are trimmed and empty fields stored as empty.
  for i in 1 .. array_length(clean, 1) loop
    clean[i] := nullif(btrim(clean[i]), '');
  end loop;

  update public.customers set
    name = clean[1], phone = clean[2], address_line1 = clean[3], address_line2 = clean[4],
    city = clean[5], region = clean[6], postal_code = clean[7], country = clean[8]
  where lower(email) = v_email and (auth_user_id is null or auth_user_id = auth.uid());
  if not found then
    raise exception 'Your account isn''t ready yet. Reload the page and try again.' using errcode = 'P0002';
  end if;
end $$;

revoke all on function public.my_profile() from public, anon;
revoke all on function public.save_my_profile(text, text, text, text, text, text, text, text) from public, anon;
grant execute on function public.my_profile() to authenticated;
grant execute on function public.save_my_profile(text, text, text, text, text, text, text, text) to authenticated;
