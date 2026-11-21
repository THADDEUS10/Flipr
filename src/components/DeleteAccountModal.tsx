import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "./Modal";
import { TrashIcon, CheckCircleIcon } from "./Icons";
import { useAuth } from "../context/AuthContext";
import { usePremium } from "../context/PremiumContext";

/** Confirmation popup for "Delete account". The person must type DELETE before the button works. */
export function DeleteAccountModal({ onClose }: { onClose: () => void }) {
  const { deleteAccount } = useAuth();
  const { premium } = usePremium();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => { onClose(); if (done) navigate("/"); };

  async function remove() {
    setBusy(true); setError(null);
    const err = await deleteAccount();
    if (err) { setError(err); setBusy(false); return; }
    setDone(true); setBusy(false);
  }

  if (done) {
    return (
      <Modal label="Account deleted" onClose={close}>
        <div className="modal-icon"><CheckCircleIcon /></div>
        <h2>Account deleted</h2>
        <p>Your account and saved history have been deleted. You can still use FLIPR as a guest.</p>
        <div className="modal-actions"><button type="button" className="btn btn-primary" onClick={close}>Close</button></div>
      </Modal>
    );
  }

  return (
    <Modal label="Delete account" onClose={onClose}>
      <div className="modal-icon"><TrashIcon size={34} /></div>
      <h2>Delete your account?</h2>
      <p>This permanently deletes your account and your saved history. This cannot be undone.{premium ? " You will also lose your unlimited downloads." : ""}</p>
      <label className="field-label" htmlFor="del-confirm" style={{ textAlign: "left", display: "block", margin: "6px 0" }}>Type DELETE to confirm</label>
      <input id="del-confirm" className="confirm-input" autoComplete="off" value={text} onChange={(e) => setText(e.target.value)} placeholder="DELETE" style={{ width: "100%" }} />
      {error && <div className="field-error" role="alert" style={{ marginTop: 8 }}>{error}</div>}
      <div className="modal-actions">
        <button type="button" className="btn btn-soft" onClick={onClose} disabled={busy}>Cancel</button>
        <button type="button" className="btn btn-red" disabled={busy || text.trim() !== "DELETE"} onClick={() => void remove()}>{busy ? "Deleting…" : "Delete my account"}</button>
      </div>
    </Modal>
  );
}
