-- One admin only (Matan, 13 Oct 2026): jlouise@matanwildphotography.com.
-- Everyone else comes off the allowlist and loses admin rights now (their shop account stays).
delete from public.admin_allowlist where email <> 'jlouise@matanwildphotography.com';
insert into public.admin_allowlist (email) values ('jlouise@matanwildphotography.com') on conflict do nothing;
delete from public.admins where lower(email) <> 'jlouise@matanwildphotography.com';
