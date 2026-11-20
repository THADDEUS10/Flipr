import { supabase } from "./supabase";

/** Premium and download limits stay OFF until you set VITE_ENABLE_PREMIUM=true (and finish the Supabase + Paystack setup). */
export const PREMIUM_ENABLED = import.meta.env.VITE_ENABLE_PREMIUM === "true" && supabase !== null;
export const FREE_LIMIT = 3;

export type Plan = "monthly" | "yearly";
export const PLANS: Record<Plan, { label: string; price: string; per: string }> = {
  monthly: { label: "$2 per Month", price: "$2", per: "Month" },
  yearly: { label: "$20 per Year (Best Value)", price: "$20", per: "Year" }
};

export interface DownloadStatus { premium: boolean; used: number; limit: number; until: string | null }

export async function fetchStatus(): Promise<DownloadStatus | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("download_status");
  if (error || !data) return null;
  return data as DownloadStatus;
}

export interface ConsumeResult { allowed: boolean; reason?: string; premium?: boolean; used?: number; limit?: number }

/** Uses up one free download (premium users are let through). Returns null if the check could not run. */
export async function consumeDownload(): Promise<ConsumeResult | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("consume_download");
  if (error || !data) return null;
  return data as ConsumeResult;
}

/** Asks the server for a Paystack payment page for the chosen plan. */
export async function startCheckout(plan: Plan): Promise<{ url?: string; error?: string }> {
  if (!supabase) return { error: "Payments are not available." };
  const { data, error } = await supabase.functions.invoke("paystack-init", { body: { plan } });
  if (error) {
    try {
      const body = await (error as unknown as { context?: Response }).context?.json();
      if (body?.error) return { error: String(body.error) };
    } catch { /* fall through */ }
    return { error: "Couldn’t start the payment. Please try again." };
  }
  if (data?.error) return { error: String(data.error) };
  return data?.url ? { url: String(data.url) } : { error: "Couldn’t start the payment. Please try again." };
}
