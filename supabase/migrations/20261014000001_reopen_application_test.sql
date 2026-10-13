-- Re-open matansharon@gmail.com's Ambassador application so the approval set in monday is processed again.
-- On 13 Oct the Make scenario froze (one incomplete run with in-order processing on), so the approval
-- never ran: no welcome email, no terms link, no tools, and "Access given" was typed in monday by hand.
-- Back at "new", the next 10-minute check reads Decision = Approved and sends the welcome email with the
-- terms link (Shop result = Waiting for terms). Skipped if this email is already an ambassador.
update public.ambassador_applications a
   set status = 'new', decided_at = null, accept_token_hash = null, accepted_at = null
 where lower(a.email) = 'matansharon@gmail.com'
   and a.status <> 'new'
   and not exists (
     select 1 from public.beta_members b
       join public.customers c on c.id = b.customer_id
      where lower(c.email) = lower(a.email));
