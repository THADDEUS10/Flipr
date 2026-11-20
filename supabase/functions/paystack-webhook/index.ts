// Paystack calls this after a payment. It checks the signature, then switches the user's plan on.
// Deploy with "Verify JWT" turned OFF (Paystack does not send a Supabase login).
// Secrets: PAYSTACK_SECRET_KEY. Optional: PAYSTACK_CURRENCY, PRICE_MONTHLY, PRICE_YEARLY (same as paystack-init)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CURRENCY = Deno.env.get("PAYSTACK_CURRENCY") ?? "USD";
const PLANS: Record<string, { amount: number; days: number }> = {
  monthly: { amount: Number(Deno.env.get("PRICE_MONTHLY") ?? 200), days: 31 },
  yearly: { amount: Number(Deno.env.get("PRICE_YEARLY") ?? 2000), days: 366 }
};

async function hmacHex(secret: string, body: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-512" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(body));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";
  const expected = await hmacHex(Deno.env.get("PAYSTACK_SECRET_KEY") ?? "", raw);
  if (!signature || signature !== expected) return new Response("Bad signature", { status: 401 });

  const evt = JSON.parse(raw);
  if (evt.event === "charge.success") {
    const d = evt.data ?? {};
    const plan = PLANS[d?.metadata?.plan as string];
    const userId = d?.metadata?.user_id as string | undefined;
    // Only accept a real, fully paid charge in the right currency for a known plan
    if (d.status === "success" && userId && plan && d.currency === CURRENCY && d.amount >= plan.amount) {
      const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

      // Record the payment; if this reference was already recorded, stop (webhooks can repeat)
      const { error: dup } = await admin.from("payments").insert({
        reference: d.reference, user_id: userId, plan: d.metadata.plan, amount: d.amount, currency: d.currency
      });
      if (!dup) {
        const { data: cur } = await admin.from("subscriptions").select("status,current_period_end").eq("user_id", userId).maybeSingle();
        const stillActive = cur?.status === "active" && cur.current_period_end && new Date(cur.current_period_end) > new Date();
        const start = stillActive ? new Date(cur!.current_period_end) : new Date();
        const end = new Date(start.getTime() + plan.days * 86400000);
        await admin.from("subscriptions").upsert({
          user_id: userId, plan: d.metadata.plan, status: "active",
          current_period_end: end.toISOString(), updated_at: new Date().toISOString()
        });
      }
    }
  }
  return new Response("ok", { status: 200 });
});
