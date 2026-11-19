import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { TextField } from "../components/TextField";
import { LockIcon, MailIcon, UserIcon, AlertIcon } from "../components/Icons";
import { googleEnabled } from "../lib/supabase";
import { validateEmail, validateName, validatePassword } from "../lib/validation";

export default function SignUp() {
  const { signUp, signInWithGoogle, isDemo } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errs, setErrs] = useState<Record<string, string | null>>({});
  const [formErr, setFormErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password, { requireStrong: true }),
      confirm: validatePassword(confirm) ?? (confirm !== password ? "Passwords do not match." : null)
    };
    setErrs(next); setFormErr(null); setInfo(null);
    if (Object.values(next).some(Boolean)) return;
    setBusy(true);
    const err = await signUp(name.trim(), email.trim(), password);
    setBusy(false);
    if (err) { setFormErr(err); return; }
    if (isDemo) navigate("/");
    else setInfo("Account created. Check your email to confirm it, then sign in.");
  }

  async function google() {
    const err = await signInWithGoogle();
    if (err) setFormErr(err);
  }

  return (
    <>
      <h1 className="auth-title">Create Your Account</h1>
      <p className="auth-sub">Continue your conversion journey by signing up to Flipr</p>
      <form className="card" onSubmit={onSubmit} noValidate>
        <TextField label="Name" name="name" value={name} onChange={setName} icon={<UserIcon />} placeholder="John Doe" autoComplete="name" error={errs.name} />
        <TextField label="Mail" name="email" type="email" value={email} onChange={setEmail} icon={<MailIcon />} placeholder="user@example.com" autoComplete="email" error={errs.email} />
        <TextField label="Password" name="password" type="password" value={password} onChange={setPassword} icon={<LockIcon />} placeholder="At least 8 characters" autoComplete="new-password" error={errs.password} />
        <TextField label="Confirm Password" name="confirm" type="password" value={confirm} onChange={setConfirm} icon={<LockIcon />} placeholder="Repeat your password" autoComplete="new-password" error={errs.confirm} />
        {formErr && <div className="banner error" role="alert"><AlertIcon />{formErr}</div>}
        {info && <div className="banner success" role="status">{info}</div>}
        <button className="btn btn-primary" disabled={busy}>{busy ? "Creating account…" : "Create Account"}</button>
        {googleEnabled && (
          <>
            <div className="divider">or</div>
            <button type="button" className="btn btn-soft" onClick={google}>Continue with Google</button>
          </>
        )}
        <div className="card-foot">Already have an account? <Link to="/signin">Sign in</Link></div>
        <div className="guest-note"><Link to="/"><b>Continue as a guest</b></Link> · You won’t be able to download your results</div>
      </form>
    </>
  );
}
