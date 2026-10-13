-- Ambassadors also give their Facebook name, and each acceptance gets a signed-terms PDF
-- (made by the "Personal copies" worker, stored privately, attached to their monday row).
alter table public.beta_members
  add column if not exists facebook       text check (length(facebook) <= 100),
  add column if not exists terms_pdf_path text,
  add column if not exists terms_pdf_at   timestamptz;

-- Private storage for the signed-terms PDFs (service role only; Make gets a one-hour link to attach it in monday).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documents', 'documents', false, 10485760, array['application/pdf'])
on conflict (id) do nothing;
