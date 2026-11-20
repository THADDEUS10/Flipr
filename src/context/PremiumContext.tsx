import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { UpgradeModal } from "../components/UpgradeModal";
import { PREMIUM_ENABLED, FREE_LIMIT, consumeDownload, fetchStatus, type DownloadStatus } from "../lib/premium";

interface PremiumCtx {
  enabled: boolean;
  ready: boolean;
  premium: boolean;
  used: number;
  limit: number;
  until: string | null;
  refresh: () => Promise<void>;
  /** Call right before a download. Resolves true if the download may go ahead. */
  requestDownload: () => Promise<boolean>;
  openUpgrade: () => void;
}

const Ctx = createContext<PremiumCtx | null>(null);

export function PremiumProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [status, setStatus] = useState<DownloadStatus | null>(null);
  const [ready, setReady] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);

  const refresh = useCallback(async () => {
    if (!PREMIUM_ENABLED || !user) { setStatus(null); setReady(true); return; }
    const s = await fetchStatus();
    if (alive.current) { setStatus(s); setReady(true); }
  }, [user]);

  useEffect(() => { void refresh(); }, [refresh]);

  const requestDownload = useCallback(async () => {
    if (!PREMIUM_ENABLED) return true;
    const r = await consumeDownload();
    if (!r) return true; // the check could not run (offline or not set up yet): do not block people
    if (r.allowed) { await refresh(); return true; }
    if (r.reason === "limit") { await refresh(); setShowUpgrade(true); }
    return false;
  }, [refresh]);

  const value = useMemo<PremiumCtx>(() => ({
    enabled: PREMIUM_ENABLED, ready,
    premium: status?.premium ?? false, used: status?.used ?? 0, limit: status?.limit ?? FREE_LIMIT, until: status?.until ?? null,
    refresh, requestDownload, openUpgrade: () => setShowUpgrade(true)
  }), [ready, status, refresh, requestDownload]);

  return (
    <Ctx.Provider value={value}>
      {children}
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </Ctx.Provider>
  );
}

export function usePremium(): PremiumCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePremium must be used inside PremiumProvider");
  return c;
}
