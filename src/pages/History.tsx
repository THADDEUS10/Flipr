import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCategory } from "../lib/converters";
import { deleteHistory, listHistory, setBookmark, type HistoryEntry } from "../lib/history";
import { Modal } from "../components/Modal";
import { AlertIcon, BookmarkIcon, CheckCircleIcon, TrashIcon } from "../components/Icons";
import { CategoryIcon } from "../components/CategoryIcon";

type Section = "bookmarks" | "recent";

function groupByMonth(items: HistoryEntry[]): Array<{ label: string; items: HistoryEntry[] }> {
  const groups = new Map<string, HistoryEntry[]>();
  for (const it of items) {
    const d = new Date(it.createdAt);
    const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase();
    groups.set(label, [...(groups.get(label) ?? []), it]);
  }
  return Array.from(groups, ([label, list]) => ({ label, items: list }));
}

export default function History() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<Section | null>("recent");
  const [pendingDelete, setPendingDelete] = useState<HistoryEntry | null>(null);
  const [deleted, setDeleted] = useState(false);

  const email = user?.email ?? "";

  const load = useCallback(async () => {
    if (!email) return;
    setLoading(true); setError(null);
    try { setEntries(await listHistory(email)); }
    catch { setError("Couldn’t load your history. Check your connection and try again."); }
    finally { setLoading(false); }
  }, [email]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!deleted) return;
    const t = setTimeout(() => setDeleted(false), 1800);
    return () => clearTimeout(t);
  }, [deleted]);

  const bookmarks = useMemo(() => entries.filter((e) => e.bookmarked), [entries]);

  async function toggleBookmark(entry: HistoryEntry) {
    const next = !entry.bookmarked;
    setEntries((list) => list.map((x) => (x.id === entry.id ? { ...x, bookmarked: next } : x)));
    try { await setBookmark(email, entry.id, next); }
    catch {
      setEntries((list) => list.map((x) => (x.id === entry.id ? { ...x, bookmarked: !next } : x)));
      setError("Couldn’t update that bookmark.");
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setPendingDelete(null);
    try {
      await deleteHistory(email, target.id);
      setEntries((list) => list.filter((x) => x.id !== target.id));
      setDeleted(true);
    } catch {
      setError("Couldn’t delete that conversion.");
    }
  }

  function renderList(items: HistoryEntry[], emptyText: string) {
    if (items.length === 0) return <div className="card-foot">{emptyText}</div>;
    return (
      <div className="history-scroll">
        {groupByMonth(items).map((g) => (
          <div key={g.label}>
            <div className="history-month">{g.label}</div>
            {g.items.map((it) => {
              const cat = getCategory(it.categoryId);
              const d = new Date(it.createdAt);
              return (
                <article key={it.id} className="history-item">
                  <div className="history-top">
                    <span className="history-chip"><CategoryIcon id={cat.icon} size={14} /> {cat.label}</span>
                    <div className="chip-actions">
                      <button className="chip-btn" onClick={() => navigate("/", { state: { apply: it } })}>Apply</button>
                      <button className="chip-btn" onClick={() => void toggleBookmark(it)}
                        aria-label={it.bookmarked ? "Remove bookmark" : "Add bookmark"} aria-pressed={it.bookmarked}><BookmarkIcon filled={it.bookmarked} /></button>
                      <button className="chip-btn danger" onClick={() => setPendingDelete(it)} aria-label="Delete conversion"><TrashIcon /></button>
                    </div>
                  </div>
                  <div className="history-values">
                    <div><small>From: {it.from}</small><strong>{it.amount}</strong></div>
                    <span aria-hidden className="history-arrow">→</span>
                    <div><small>To: {it.to}</small><strong>{it.result}</strong></div>
                  </div>
                  <div className="history-date">
                    <span>{d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                    <span>{d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
                  </div>
                </article>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  const header = (
    <>
      <h1 className="auth-title">History</h1>
      <p className="auth-sub">Access your previous conversions and you can as well apply them again to get work done faster.</p>
    </>
  );

  if (authLoading) return <>{header}</>;

  if (!user) {
    return (
      <>
        {header}
        <div className="card">
          <div className="banner info">Log in to see your saved conversions.</div>
          <Link to="/signin" className="btn btn-primary" style={{ display: "grid", placeItems: "center", textDecoration: "none" }}>Login</Link>
        </div>
      </>
    );
  }

  return (
    <>
      {header}
      <section className="card" aria-label="Conversion history">
        {error && <div className="banner error" role="alert"><AlertIcon />{error}</div>}
        {loading ? <div className="card-foot">Loading…</div> : (
          <>
            <button className="accordion" aria-expanded={open === "bookmarks"} onClick={() => setOpen(open === "bookmarks" ? null : "bookmarks")}>
              <span>Bookmarks {bookmarks.length > 0 && `(${bookmarks.length})`}</span><span aria-hidden>{open === "bookmarks" ? "▴" : "▾"}</span>
            </button>
            {open === "bookmarks" && renderList(bookmarks, "No bookmarks yet. Tap the bookmark icon on a conversion to keep it here.")}

            <button className="accordion" aria-expanded={open === "recent"} onClick={() => setOpen(open === "recent" ? null : "recent")}>
              <span>Recent {entries.length > 0 && `(${entries.length})`}</span><span aria-hidden>{open === "recent" ? "▴" : "▾"}</span>
            </button>
            {open === "recent" && renderList(entries, "Nothing here yet. Press Download Result on a conversion to save it.")}
          </>
        )}
      </section>

      {pendingDelete && (
        <Modal label="Delete conversion" onClose={() => setPendingDelete(null)}>
          <div className="modal-icon"><TrashIcon size={32} /></div>
          <h2>Delete conversion?</h2>
          <p>You won’t be able to get this back or recycle it after deleting the conversion.</p>
          <div className="modal-actions">
            <button className="btn btn-soft" onClick={() => setPendingDelete(null)}>Cancel</button>
            <button className="btn btn-red" onClick={() => void confirmDelete()}>Yes, delete</button>
          </div>
        </Modal>
      )}

      {deleted && (
        <Modal label="Conversion deleted" onClose={() => setDeleted(false)}>
          <div className="modal-icon"><CheckCircleIcon size={36} /></div>
          <h2>Conversion Deleted</h2>
          <p>The conversion was deleted successfully.</p>
        </Modal>
      )}
    </>
  );
}
