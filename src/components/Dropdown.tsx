import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { SearchIcon } from "./Icons";

const BoldTriangle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" aria-hidden><path d="M5 8.5h14L12 17.5z" /></svg>
);
const ArrowUp = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 19V5M5 12l7-7 7 7" /></svg>
);
const ArrowDown = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 5v14M5 12l7 7 7-7" /></svg>
);

export interface Option { id: string; label: string; icon?: ReactNode }

export function Dropdown({ options, value, onChange, placeholder }: { options: Option[]; value: string; onChange: (id: string) => void; placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [hint, setHint] = useState<"none" | "down" | "up">("none");
  const current = options.find((o) => o.id === value);

  useEffect(() => {
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, []);

  const filtered = useMemo(() => options.filter((o) => o.label.toLowerCase().includes(q.trim().toLowerCase())), [options, q]);

  // Shows a "scroll down" button while there is more below, and a "top" button once the end is reached.
  const updateHint = () => {
    const el = panelRef.current;
    if (!el) return;
    if (el.scrollHeight <= el.clientHeight + 4) { setHint("none"); return; }
    setHint(el.scrollTop + el.clientHeight >= el.scrollHeight - 4 ? "up" : "down");
  };
  useEffect(() => { if (open) { const id = requestAnimationFrame(updateHint); return () => cancelAnimationFrame(id); } }, [open, filtered]);

  return (
    <div className="dropdown" ref={ref}>
      <button type="button" className="dropdown-trigger" aria-haspopup="listbox" aria-expanded={open} onClick={() => { setOpen((o) => !o); setQ(""); }}>
        <span>{current?.icon}</span><span className="grow" style={current ? undefined : { color: "var(--outline)" }}>{current?.label ?? placeholder ?? ""}</span><span className={`dd-arrow${open ? " open" : ""}`}><BoldTriangle /></span>
      </button>
      {open && (
        <div className="dropdown-panel" ref={panelRef} onScroll={updateHint}>
          <div className="dd-search-wrap"><div className="input-row" style={{ height: 36 }}>
            <span className="leading"><SearchIcon /></span>
            <input autoFocus placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search conversion types" />
          </div></div>
          <div role="listbox">
            {filtered.length === 0 && <div className="card-foot">No match</div>}
            {filtered.map((o) => (
              <button key={o.id} type="button" role="option" aria-selected={o.id === value} className="dropdown-option"
                onClick={() => { onChange(o.id); setOpen(false); }}>
                <span>{o.icon}</span><span>{o.label}</span>
              </button>
            ))}
          </div>
          {hint !== "none" && (
            <div className="dd-hint-wrap">
              {hint === "down"
                ? <button type="button" className="dd-hint" aria-label="Scroll down" onClick={() => panelRef.current?.scrollBy({ top: (panelRef.current?.clientHeight ?? 200) * 0.8, behavior: "smooth" })}><ArrowDown /></button>
                : <button type="button" className="dd-hint dd-hint-top" aria-label="Back to top" onClick={() => panelRef.current?.scrollTo({ top: 0, behavior: "smooth" })}><ArrowUp /> Top</button>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
