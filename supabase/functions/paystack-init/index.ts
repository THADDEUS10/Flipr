// Starts a Paystack checkout for the signed-in user and returns the payment page address.
// Secrets needed (Supabase -> Edge Functions -> Secrets): PAYSTACK_SECRET_KEY, SITE_URL
// Optional: PAYSTACK_CURRENCY (default USD), PRICE_MONTHLY and PRICE_YEARLY in the smallest unit (default 200 and 2000 = $2 and $20)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const PLANS: Record<string, number> = {
  monthly: Number(Deno.env.get("PRICE_MONTHLY") ?? 200),
  yearly: Number(Deno.env.get("PRICE_YEARLY") ?? 2000)
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const supa = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } }
    });
    const { data: { user } } = await supa.auth.getUser();
    if (!user || !user.email) return json({ error: "Please sign in first." }, 401);

    const { plan } = await req.json();
    const amount = PLANS[plan as string];
    if (!amount) return json({ error: "Unknown plan." }, 400);

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${Deno.env.get("PAYSTACK_SECRET_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        amount,
        currency: Deno.env.get("PAYSTACK_CURRENCY") ?? "USD",
        callback_url: `${Deno.env.get("SITE_URL")}/premium`,
        metadata: { user_id: user.id, plan }
      })
    });
    const out = await res.json();
    if (!out.status) return json({ error: out.message ?? "Could not start the payment." }, 400);
    return json({ url: out.data.authorization_url });
  } catch (_e) {
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
});
