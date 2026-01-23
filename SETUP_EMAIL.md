# Setting Up Email Invites

To enable email invitations, you need to set up your Resend API key in Supabase.

## Step 1: Get Your Resend API Key

1. Sign up at [resend.com](https://resend.com) (free tier available)
2. Go to your dashboard → API Keys
3. Create a new API key and copy it

## Step 2: Set the API Key in Supabase

### Option A: Using Supabase CLI (Recommended)

If you have the Supabase CLI installed:

```bash
# Make sure you're logged in
supabase login

# Link to your project (if not already linked)
supabase link --project-ref your-project-ref

# Set the secret
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
```

### Option B: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** → **Edge Functions** → **Secrets**
3. Click **Add Secret**
4. Name: `RESEND_API_KEY`
5. Value: Paste your Resend API key
6. Click **Save**

## Step 3: Deploy the Edge Function

After setting the secret, deploy the function:

```bash
supabase functions deploy send-invite
```

## Step 4: Update Email From Address (Optional)

If you have a verified domain in Resend, update the `from` field in `supabase/functions/send-invite/index.ts`:

```typescript
from: "Food Security Assessment <noreply@yourdomain.com>",
```

Otherwise, it will use the default `onboarding@resend.dev` which works for testing.

## Testing

After deployment, try inviting a user through the Team Manager interface. The email should be sent automatically when you click "Invite".
