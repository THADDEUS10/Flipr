import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePremium } from "../context/PremiumContext";
import { PLANS, startCheckout, type Plan } from "../lib/premium";

export default function Premium() {
  const { user } = useAuth();
  const { enabled, premium, until, refresh } = usePremium();
  const [params] = useSearchParams();
  const returning = params.has("reference") || params.has("trxref");
  const [plan, setPlan] = useState<Plan>("yearly");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tries, setTries] = useState(0);

  // After paying, Paystack tells our server a moment later, so check a few times
  useEffect(() => {
    if (!returning || premium || tries >= 10) return;
    const t = setTimeout(async () => { await refresh(); setTries((n) => n + 1); }, 3000);
    return () => clearTimeout(t);
  }, [returning, premium, tries, refresh]);

  async function pay() {
    setBusy(true); setError(null);
    const r = await startCheckout(plan);
    if (r.url) { window.location.href = r.url; return; }
    setError(r.error ?? "Couldn’t start the payment."); setBusy(false);
  }

  const untilText = until ? new Date(until).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : null;
  const back = <Link to="/" className="legal-back">← Back to converter</Link>;

  if (!enabled) return <article className="legal premium-page">{back}<h1>Premium</h1><p>Premium isn’t available yet.</p></article>;
  if (!user) return (
    <article className="legal premium-page">{back}<h1>Unlock Unlimited Downloads</h1>
      <p>Sign in to your account first, then choose a plan.</p>
      <Link to="/signin" className="btn btn-primary" style={{ display: "grid", placeItems: "center", textDecoration: "none" }}>Login</Link>
    </article>
  );

  if (returning) return (
    <article className="legal premium-page">{back}
      {premium ? (<><h1>Payment received</h1><p>Your subscription has been made. You now have unlimited downloads{untilText ? ` until ${untilText}` : ""}.</p>
        <Link to="/" className="btn btn-primary" style={{ display: "grid", placeItems: "center", textDecoration: "none" }}>Start converting</Link></>)
      : tries >= 10 ? (<><h1>Still confirming</h1><p>We haven’t received your payment confirmation yet. This can take a few minutes. Refresh this page later. If it still doesn’t update, contact us with your Paystack receipt.</p></>)
      : (<><h1>Confirming your payment…</h1><p>Please wait a moment. Don’t close this page.</p></>)}
    </article>
  );

  return (
    <article className="legal premium-page">{back}
      <h1>Unlock Unlimited Downloads</h1>
      {premium && <p className="premium-active">You have unlimited downloads{untilText ? ` until ${untilText}` : ""}. You can add more time below.</p>}
      <div className="plan-switch" role="tablist" aria-label="Choose a plan">
        {(Object.keys(PLANS) as Plan[]).map((p) => (
          <button key={p} type="button" role="tab" aria-selected={plan === p} className={`tab${plan === p ? " active" : ""}`} onClick={() => setPlan(p)}>{PLANS[p].label}</button>
        ))}
      </div>
      <p className="plan-price"><b>{PLANS[plan].price}</b> / {PLANS[plan].per}</p>
      <p>Pay securely with Paystack to unlock unlimited downloads on your Flipr account. This is a one-off payment and does not renew by itself.</p>
      {error && <div className="field-error" role="alert">{error}</div>}
      <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void pay()} style={{ width: "100%", marginTop: 10 }}>{busy ? "Opening payment…" : "Make Payment"}</button>
    </article>
  );
}
