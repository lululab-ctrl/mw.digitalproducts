-- Ambassador decisions go out faster (Matan, 13 Oct 2026): the check runs every 2 minutes instead of 10.
-- It only asks Make (4 operations) every 2 minutes while an application arrived in the last 2 hours; for
-- older waiting applications it keeps the old 10-minute pace (see FRESH_MS in scheduler/applications.ts).
-- Same job name, so this replaces the 10-minute schedule.
select cron.schedule('mwp-applications', '*/2 * * * *', $$ select public.call_scheduler('applications') $$);
