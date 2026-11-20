# Turning on FLIPR premium (3 free downloads, then $2/month or $20/year)

Premium is OFF by default (`VITE_ENABLE_PREMIUM=false`). Nothing changes for users until you finish these steps.

## 1. Paystack
1. Create an account at paystack.com and finish the business verification.
2. Settings -> API Keys & Webhooks: copy the **Secret key**. Start with the TEST key (starts with `sk_test_`).
3. Dollar payments: ask Paystack support to enable USD for your account. Until then, test in Naira: set the secrets `PAYSTACK_CURRENCY=NGN`, `PRICE_MONTHLY=300000`, `PRICE_YEARLY=3000000` (amounts are in kobo, so 300000 = N3,000). The popup text in the app still says $2 and $20, so change it in `src/lib/premium.ts` if you charge in Naira.

## 2. Supabase database
SQL Editor -> paste everything from `supabase/premium.sql` -> Run.

## 3. Supabase functions (Dashboard -> Edge Functions)
1. Create a function named `paystack-init`, paste `supabase/functions/paystack-init/index.ts`, deploy.
2. Create a function named `paystack-webhook`, paste `supabase/functions/paystack-webhook/index.ts`, and turn **Verify JWT OFF**, then deploy.
3. Edge Functions -> Secrets, add:
   - `PAYSTACK_SECRET_KEY` = your Paystack secret key
   - `SITE_URL` = `https://flipr-convert.pages.dev`
   - (optional) `PAYSTACK_CURRENCY`, `PRICE_MONTHLY`, `PRICE_YEARLY` as in step 1

## 4. Tell Paystack where to send payment news
Paystack -> Settings -> API Keys & Webhooks -> Webhook URL:
`https://YOUR-PROJECT-REF.supabase.co/functions/v1/paystack-webhook`

## 5. Switch it on in the app
In your project's `.env` file set `VITE_ENABLE_PREMIUM=true`, then run `npm run build` and deploy.

## 6. Test before you go live
- Use a NEW account, make 3 downloads, then the 4th should show "Unlock Unlimited Downloads".
- Pay with a Paystack TEST card (see Paystack's docs for test cards). You should land on /premium and see "Payment received".
- To reset a test account's free downloads: `update public.download_usage set used = 0;`
- Only switch to your LIVE Paystack key after the test works.

## Notes
- A plan is a one-off payment for one month or one year. It does not renew by itself.
- The free-download count is kept in Supabase, so it cannot be bypassed in the browser.
- If the server check fails (for example Supabase is down), downloads are allowed rather than blocked.
- The app uses up a free download when the person taps Download, even if the file then fails to build.
