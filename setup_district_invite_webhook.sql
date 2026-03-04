-- 1. Ensure the Edge Function is triggered whenever a new invite is queued
-- Run this in your Supabase SQL Editor

-- Use a standard name for the hook
DROP TRIGGER IF EXISTS on_district_invite_queued ON district_invite_emails;

CREATE TRIGGER on_district_invite_queued
  AFTER INSERT ON district_invite_emails
  FOR EACH ROW
  EXECUTE FUNCTION supabase_functions.http_request(
    'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-district-invite',
    'POST',
    '{"Content-Type":"application/json", "Authorization":"Bearer YOUR_SERVICE_ROLE_KEY"}',
    '{}' -- The payload is automatically handled by the trigger system in newer Supabase versions, 
         -- but for custom webhooks via Dashboard, follow the steps below.
  );

/*
  NOTE FOR DASHBOARD SETUP (EASIER):
  Instead of the complex SQL above, it's recommended to use the Supabase Dashboard:

  1. Go to "Database" -> "Webhooks"
  2. Click "Create a new webhook"
  3. Name: "send_district_invite_email"
  4. Table: "district_invite_emails"
  5. Events: Check "Insert"
  6. Type: "Supabase Edge Function"
  7. Edge Function: Select "send-district-invite"
  8. Click "Create Webhook"

  This will automatically pass the row data to the function we just created.
*/
