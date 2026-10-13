-- Fix: "Your signed copy is still being made" forever for the first ambassadors.
-- Their signed-terms PDF was stored (terms_pdf_path) and sent to monday (terms_pdf_at) before the
-- terms_pdf_made_at column existed (migration 20261013000013), so the download never saw it as ready,
-- and the worker, seeing it already sent, never made it again. The stored file is the copy they
-- signed, so mark it ready as of the time it was made.
update public.beta_members
   set terms_pdf_made_at = terms_pdf_at
 where terms_pdf_path is not null
   and terms_pdf_made_at is null
   and terms_pdf_at is not null;
