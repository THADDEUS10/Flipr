import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase, isDemoMode } from "../lib/supabase";

export interface AppUser { name: string; email: string }

export const DEMO_RESET_CODE = "123456";
const DEMO_KEY = "flipr_demo_user";

interface AuthCtx {
  user: AppUser | null;
  loading: boolean;
  isDemo: boolean;
  /** Each action returns an error message, or null on success */
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (name: string, email: string, password: string) => Promise<string | null>;
  signInWithGoogle: () => Promise<string | null>;
  signOut: () => Promise<void>;
  requestReset: (email: string) => Promise<string | null>;
  verifyReset: (email: string, code: string) => Promise<string | null>;
  setNewPassword: (password: string) => Promise<string | null>;
}

const Ctx = createContext<AuthCtx | null>(null);

function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "";
  return local ? local.charAt(0).toUpperCase() + local.slice(1) : "Guest";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      try {
        const raw = localStorage.getItem(DEMO_KEY);
        if (raw) setUser(JSON.parse(raw) as AppUser);
      } catch { /* ignore */ }
      setLoading(false);
      return;
    }
    const toUser = (u: { email?: string | null; user_metadata?: Record<string, unknown> } | null | undefined): AppUser | null =>
      u ? { email: u.email ?? "", name: (u.user_metadata?.name as string) || nameFromEmail(u.email ?? "") } : null;

    supabase.auth.getSession().then(({ data }) => {
      setUser(toUser(data.session?.user));
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => setUser(toUser(session?.user)));
    return () => sub.subscription.unsubscribe();
  }, []);

  const saveDemo = (u: AppUser) => {
    setUser(u);
    try { localStorage.setItem(DEMO_KEY, JSON.stringify(u)); } catch { /* ignore */ }
  };

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      // Demo mode: no real accounts. Any valid-looking credentials work.
      if (password.length < 1) return "We couldn’t sign you in. Check your password.";
      saveDemo({ email, name: nameFromEmail(email) });
      return null;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? "We couldn’t sign you in. Check your password." : null;
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    if (!supabase) {
      saveDemo({ email, name });
      return null;
    }
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    return error ? error.message : null;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return "Google sign-in needs Supabase. Add your keys in .env to turn it on.";
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
    return error ? error.message : null;
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    else {
      try { localStorage.removeItem(DEMO_KEY); } catch { /* ignore */ }
      setUser(null);
    }
  }, []);

  const requestReset = useCallback(async (email: string) => {
    if (!supabase) return null;
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return error ? error.message : null;
  }, []);

  const verifyReset = useCallback(async (email: string, code: string) => {
    if (!supabase) return code === DEMO_RESET_CODE ? null : "Incorrect code, please input the right code.";
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "recovery" });
    return error ? "Incorrect code, please input the right code." : null;
  }, []);

  const setNewPassword = useCallback(async (password: string) => {
    if (!supabase) return null;
    const { error } = await supabase.auth.updateUser({ password });
    return error ? error.message : null;
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({ user, loading, isDemo: isDemoMode, signIn, signUp, signInWithGoogle, signOut, requestReset, verifyReset, setNewPassword }),
    [user, loading, signIn, signUp, signInWithGoogle, signOut, requestReset, verifyReset, setNewPassword]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
}
