import { useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DEMO_RESET_CODE, useAuth } from "../context/AuthContext";
import { TextField } from "../components/TextField";
import { AlertIcon, CheckCircleIcon, LockIcon, MailIcon, WarningFilledIcon } from "../components/Icons";
import { Modal } from "../components/Modal";
import { validateEmail, validatePassword } from "../lib/validation";

type Step = "email" | "code" | "password" | "done";
const LENGTH = 6;

export default function ResetPassword() {
  const { requestReset, verifyReset, setNewPassword, signOut, isDemo } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(""));
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [errConfirm, setErrConfirm] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const boxes = useRef<Array<HTMLInputElement | null>>([]);

  async function sendEmail(e: FormEvent) {
    e.preventDefault();
    const ve = validateEmail(email);
    setErr(ve);
    if (ve) return;
    setBusy(true);
    const apiErr = await requestReset(email.trim());
    setBusy(false);
    if (apiErr) { setErr(apiErr); return; }
    setStep("code");
  }

  function setDigit(i: number, v: string) {
    const d = v.replace(/\D/g, "").slice(-1);
    setDigits((prev) => { const n = [...prev]; n[i] = d; return n; });
    setErr(null);
    if (d && i < LENGTH - 1) boxes.current[i + 1]?.focus();
  }
  function onKey(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) boxes.current[i - 1]?.focus();
  }
  function onPaste(e: ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!text) return;
    e.preventDefault();
    setDigits(Array.from({ length: LENGTH }, (_, i) => text[i] ?? ""));
    boxes.current[Math.min(text.length, LENGTH - 1)]?.focus();
  }

  async function checkCode(e: FormEvent) {
    e.preventDefault();
    const code = digits.join("");
    if (code.length < LENGTH) { setErr("Enter the 6-digit code."); return; }
    setBusy(true);
    const apiErr = await verifyReset(email.trim(), code);
    setBusy(false);
    if (apiErr) { setErr(apiErr); return; }
    setErr(null);
    setStep("password");
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault();
    const pe = validatePassword(password, { requireStrong: true });
    const ce = pe ? null : confirm !== password ? "Passwords do not match." : null;
    setErr(pe); setErrConfirm(ce);
    if (pe || ce) return;
    setBusy(true);
    const apiErr = await setNewPassword(password);
    setBusy(false);
    if (apiErr) { setErr(apiErr); return; }
    await signOut(); // the design says users log in again after a reset
    setStep("done");
  }

  return (
    <>
      <h1 className="auth-title">
        {step === "email" && "Reset Password"}
        {step === "code" && "Check Your Email"}
        {(step === "password" || step === "done") && "Create New Password"}
      </h1>
      <p className="auth-sub">
        {step === "email" && "Enter your email and we’ll send you a code to reset your password"}
        {step === "code" && `We sent a 6-digit code to ${email.trim()}`}
        {(step === "password" || step === "done") && "Choose a strong password to secure your account and continue converting."}
      </p>

      {step === "email" && (
        <form className="card" onSubmit={sendEmail} noValidate>
          <TextField label="Mail" name="email" type="email" value={email} onChange={setEmail} icon={<MailIcon />} placeholder="user@example.com" autoComplete="email" error={err} />
          <button className="btn btn-primary" disabled={busy}>{busy ? "Sending…" : "Send Code"}</button>
          <div className="card-foot">Remembered it? <Link to="/signin">Sign in</Link></div>
        </form>
      )}

      {step === "code" && (
        <form className="card" onSubmit={checkCode} noValidate>
          <div className="field-block">
            <span className="field-label">Verification code</span>
            <div className="code-row">
              {digits.map((d, i) => (
                <input key={i} ref={(el) => { boxes.current[i] = el; }} className={`code-box${err ? " invalid" : ""}`}
                  inputMode="numeric" autoComplete="one-time-code" maxLength={1} value={d}
                  onChange={(e) => setDigit(i, e.target.value)} onKeyDown={(e) => onKey(i, e)} onPaste={onPaste}
                  aria-label={`Digit ${i + 1}`} />
              ))}
            </div>
            {err && <div className="field-error" role="alert"><AlertIcon />{err}</div>}
          </div>
          {isDemo && <div className="banner info">Demo mode: use code {DEMO_RESET_CODE}.</div>}
          <button className="btn btn-primary" disabled={busy}>{busy ? "Checking…" : "Verify Code"}</button>
          <div className="card-foot">Wrong email? <button type="button" className="link-btn" onClick={() => { setStep("email"); setErr(null); setDigits(Array(LENGTH).fill("")); }}>Go back</button></div>
        </form>
      )}

      {(step === "password" || step === "done") && (
        <form className="card" onSubmit={savePassword} noValidate>
          <TextField label="New Password" name="password" type="password" value={password} onChange={setPassword} icon={<LockIcon />} placeholder="At least 8 characters" autoComplete="new-password" error={err} />
          <TextField label="Confirm Password" name="confirm" type="password" value={confirm} onChange={setConfirm} icon={<LockIcon />} placeholder="Repeat your password" autoComplete="new-password" error={errConfirm} />
          <div className="banner warning"><WarningFilledIcon />You will need to relog in after you reset password.</div>
          <button className="btn btn-primary" disabled={busy || step === "done"}>{busy ? "Resetting…" : "Reset Password"}</button>
        </form>
      )}

      {step === "done" && (
        <Modal label="Password reset successful" onClose={() => navigate("/signin")}>
          <div className="modal-icon" style={{ position: "relative" }}>
            <CheckCircleIcon size={44} />
            <span style={{ position: "absolute", right: -6, bottom: -4, color: "var(--primary)", background: "var(--surface)", borderRadius: 6, lineHeight: 0, padding: 1 }}><LockIcon /></span>
          </div>
          <h2 style={{ color: "var(--secondary)" }}>Congratulations</h2>
          <p>Password reset successful! You can now log in with your new password.</p>
        </Modal>
      )}
    </>
  );
}
