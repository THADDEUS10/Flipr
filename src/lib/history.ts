import { supabase } from "./supabase";

export interface HistoryEntry {
  id: string;
  categoryId: string;
  from: string;
  to: string;
  amount: string;
  result: string;
  bookmarked: boolean;
  createdAt: string; // ISO date
}

export type NewEntry = Omit<HistoryEntry, "id" | "createdAt" | "bookmarked">;

interface Row {
  id: string; category_id: string; from_unit: string; to_unit: string;
  amount: string; result: string; bookmarked: boolean; created_at: string;
}
const fromRow = (r: Row): HistoryEntry => ({
  id: r.id, categoryId: r.category_id, from: r.from_unit, to: r.to_unit,
  amount: r.amount, result: r.result, bookmarked: r.bookmarked, createdAt: r.created_at
});

// ---- Demo mode: saved in this browser only ----
const storeKey = (email: string) => `flipr_history_${email.toLowerCase()}`;
function readLocal(email: string): HistoryEntry[] {
  try { return JSON.parse(localStorage.getItem(storeKey(email)) ?? "[]") as HistoryEntry[]; } catch { return []; }
}
function writeLocal(email: string, list: HistoryEntry[]) {
  try { localStorage.setItem(storeKey(email), JSON.stringify(list)); } catch { /* storage full or blocked */ }
}

export async function listHistory(email: string): Promise<HistoryEntry[]> {
  if (!supabase) return readLocal(email).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const { data, error } = await supabase.from("conversions").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Row[]).map(fromRow);
}

export async function addHistory(email: string, e: NewEntry): Promise<void> {
  if (!supabase) {
    const entry: HistoryEntry = { ...e, id: crypto.randomUUID(), bookmarked: false, createdAt: new Date().toISOString() };
    writeLocal(email, [entry, ...readLocal(email)].slice(0, 200));
    return;
  }
  const { error } = await supabase.from("conversions").insert({
    category_id: e.categoryId, from_unit: e.from, to_unit: e.to, amount: e.amount, result: e.result
  });
  if (error) throw new Error(error.message);
}

export async function setBookmark(email: string, id: string, bookmarked: boolean): Promise<void> {
  if (!supabase) {
    writeLocal(email, readLocal(email).map((x) => (x.id === id ? { ...x, bookmarked } : x)));
    return;
  }
  const { error } = await supabase.from("conversions").update({ bookmarked }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteHistory(email: string, id: string): Promise<void> {
  if (!supabase) {
    writeLocal(email, readLocal(email).filter((x) => x.id !== id));
    return;
  }
  const { error } = await supabase.from("conversions").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
