import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { TextField } from "../components/TextField";
import { LockIcon, MailIcon, AlertIcon } from "../components/Icons";
import { googleEnabled } from "../lib/supabase";
import { validateEmail, validatePassword } from "../lib/validation";

export default function SignIn() {
  const { signIn, signInWithGoogle, isDemo } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [pwErr, setPwErr] = useState<string | null>(null);
  const [formErr, setFormErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const ee = validateEmail(email);
    const pe = validatePassword(password);
    setEmailErr(ee); setPwErr(pe); setFormErr(null);
    if (ee || pe) return;
    setBusy(true);
    const err = await signIn(email.trim(), password);
    setBusy(false);
    if (err) setFormErr(err); else navigate("/");
  }

  async function google() {
    const err = await signInWithGoogle();
    if (err) setFormErr(err);
  }

  return (
    <>
      <h1 className="auth-title">Welcome Back</h1>
      <p className="auth-sub">Access your account and keep converting without missing a step</p>
      <form className="card" onSubmit={onSubmit} noValidate>
        <TextField label="Mail" name="email" type="email" value={email} onChange={setEmail} icon={<MailIcon />} placeholder="user@example.com" autoComplete="email" error={emailErr} />
        <TextField label="Password" name="password" type="password" value={password} onChange={setPassword} icon={<LockIcon />} placeholder="Enter your password" autoComplete="current-password" error={pwErr} />
        <Link to="/reset-password" className="right-link">Forgot password?</Link>
        {formErr && <div className="banner error" role="alert"><AlertIcon />{formErr}</div>}
        <button className="btn btn-primary" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        {googleEnabled && (
          <>
            <div className="divider">or</div>
            <button type="button" className="btn btn-soft" onClick={google}>Continue with Google</button>
          </>
        )}
        <div className="card-foot">Don’t have an account? <Link to="/signup">Sign Up</Link></div>
        <div className="guest-note"><Link to="/"><b>Continue as a guest</b></Link> · You won’t be able to download your results</div>
        {isDemo && <div className="banner info">Demo mode: any valid email and password will sign you in.</div>}
      </form>
    </>
  );
}
