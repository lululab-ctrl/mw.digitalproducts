-- The Field Guides' online pages are JPEG images. The presets bucket only takes zip files, so the pages
-- get their own private bucket (service role only; readers get 10-minute links from guide-view).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('guide-pages', 'guide-pages', false, 5242880, array['image/jpeg'])
on conflict (id) do nothing;
