import { useState } from "react";
import { Modal } from "./Modal";
import { DownloadIcon } from "./Icons";
import { PLANS, startCheckout, type Plan } from "../lib/premium";

/** "Unlock Unlimited Downloads" popup shown when the free downloads are used up. */
export function UpgradeModal({ onClose }: { onClose: () => void }) {
  const [busy, setBusy] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function choose(plan: Plan) {
    setBusy(plan); setError(null);
    const r = await startCheckout(plan);
    if (r.url) { window.location.href = r.url; return; }
    setError(r.error ?? "Couldn’t start the payment.");
    setBusy(null);
  }

  return (
    <Modal label="Unlock unlimited downloads" onClose={onClose}>
      <div className="modal-icon"><DownloadIcon /></div>
      <h2>Unlock Unlimited Downloads</h2>
      <p>Enjoy unlimited downloads when you subscribe. Pick between a monthly plan or save more with a yearly plan.</p>
      <div className="modal-actions" style={{ flexDirection: "column" }}>
        {(Object.keys(PLANS) as Plan[]).map((p) => (
          <button key={p} type="button" className="btn btn-soft" disabled={busy !== null} onClick={() => void choose(p)}>
            {busy === p ? "Opening payment…" : PLANS[p].label}
          </button>
        ))}
      </div>
      {error && <div className="field-error" role="alert" style={{ justifyContent: "center", marginTop: 8 }}>{error}</div>}
    </Modal>
  );
}
