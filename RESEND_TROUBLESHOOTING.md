# Resend Email Troubleshooting

If emails aren't being sent, check these in order:

## 1. Check Edge Function Logs

In Supabase Dashboard:
- Go to **Edge Functions** → **`dynamic-processor`** → **Logs**
- Look for error messages when you try to send an invite
- Common errors you might see:
  - `Missing RESEND_API_KEY secret` → Secret not set
  - `Resend API error: ...` → API key invalid or Resend issue
  - `Invalid response from Resend API` → Resend returned unexpected format

## 2. Verify RESEND_API_KEY is Set

In Supabase Dashboard:
- **Project Settings** → **Edge Functions** → **Secrets**
- Make sure `RESEND_API_KEY` exists and has your actual Resend API key
- The key should start with `re_` (e.g., `re_123456789...`)

## 3. Check Resend Dashboard

Go to [resend.com/dashboard](https://resend.com/dashboard):
- **API Keys** → Verify your key is active
- **Logs** → Check if emails are being attempted/sent/failed
- **Domains** → If using a custom domain, it must be verified

## 4. Test Email Address

The function uses `onboarding@resend.dev` as the sender:
- This works for testing but has limitations
- For production, verify your own domain in Resend
- Update the `from` field in `supabase/functions/send-invite/index.ts`

## 5. Common Issues

### Issue: "Missing RESEND_API_KEY secret"
**Fix:** Set the secret in Supabase dashboard (see step 2)

### Issue: "Resend API error: Invalid API key"
**Fix:** 
- Regenerate API key in Resend dashboard
- Update the secret in Supabase

### Issue: "Resend API error: Domain not verified"
**Fix:**
- Use `onboarding@resend.dev` for testing (already set)
- Or verify your domain in Resend and update the `from` field

### Issue: Emails sent but not received
**Possible causes:**
- Check spam/junk folder
- Email provider blocking (common with `.go.ug` domains)
- Resend free tier limits (100 emails/day)
- Check Resend logs to see delivery status

## 6. Test the Function Directly

You can test the edge function directly:

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/dynamic-processor \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","role":"Crop Officer","url":"http://localhost:5173"}'
```

## 7. Check Browser Console

When you click "Invite", check the browser console (F12):
- Look for the error message in the toast
- Check Network tab → find the `dynamic-processor` request → see the response

## Next Steps

After checking the above:
1. Try sending an invite again
2. Check the toast message - it should now show the specific error
3. Check Supabase Edge Function logs for detailed error
4. Check Resend dashboard logs to see if the request reached Resend
