import { useEffect, useMemo, useState } from "react";
import { convertUnits, format, type Category } from "../lib/converters";
import { POPULAR_CURRENCIES, getRates } from "../lib/currency";
import { CURRENCY_INFO } from "../lib/currencyInfo";
import { downloadResultPdf, type Report } from "../lib/resultPdf";
import { addHistory } from "../lib/history";
import { useAuth } from "../context/AuthContext";
import { ClearIcon, ConvertGlyphIcon, SwapIcon, WarningFilledIcon } from "./Icons";

interface Result { value: number; steps: string[] }

interface Initial { from: string; to: string; amount: string }

export function ConvertPanel({ category, onNeedLogin, initial }: { category: Category; onNeedLogin: () => void; initial?: Initial }) {
  const { user } = useAuth();
  const isCurrency = category.kind === "currency";
  const unitCodes = isCurrency ? [...POPULAR_CURRENCIES].sort((a, b) => a.localeCompare(b)) : category.units.map((u) => u.code);

  const [from, setFrom] = useState(initial?.from ?? (isCurrency ? "USD" : category.units[0].code));
  const [to, setTo] = useState(initial?.to ?? (isCurrency ? "EUR" : category.units[1]?.code ?? category.units[0].code));
  const [amount, setAmount] = useState(initial?.amount ?? "");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [loadingRates, setLoadingRates] = useState(false);
  const [rateError, setRateError] = useState<string | null>(null);

  // Load live rates when converting currency
  useEffect(() => {
    if (!isCurrency) return;
    let cancelled = false;
    setLoadingRates(true);
    setRateError(null);
    getRates(from)
      .then((r) => { if (!cancelled) setRates(r); })
      .catch(() => { if (!cancelled) { setRates(null); setRateError("Couldn’t load live rates. Check your connection and try again."); } })
      .finally(() => { if (!cancelled) setLoadingRates(false); });
    return () => { cancelled = true; };
  }, [isCurrency, from]);

  const parsed = amount.trim() === "" ? null : Number(amount.replace(/,/g, ""));
  const invalid = parsed !== null && !Number.isFinite(parsed);

  const result: Result | null = useMemo(() => {
    if (parsed === null || !Number.isFinite(parsed)) return null;
    if (isCurrency) {
      const rate = rates?.[to];
      if (rate === undefined) return null;
      const value = from === to ? parsed : parsed * rate;
      return {
        value,
        steps: from === to
          ? ["Both currencies are the same, so the amount does not change."]
          : [
              `Start with ${format(parsed)} ${from}.`,
              `The latest rate is 1 ${from} = ${format(rate)} ${to}.`,
              `Multiply: ${format(parsed)} × ${format(rate)} = ${format(value)} ${to}.`
            ]
      };
    }
    return convertUnits(category, parsed, from, to);
  }, [parsed, category, isCurrency, from, to, rates]);

  const NOUN: Record<string, string> = {
    temperature: "temperature", weight: "weight or mass", length: "length or distance",
    area: "area", volume: "volume", time: "time", energy: "energy"
  };

  function buildReport(value: number, converted: number, steps: string[]): Report {
    const date = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const f = CURRENCY_INFO[from];
    const t = CURRENCY_INFO[to];
    if (isCurrency) {
      const rate = from === to ? 1 : rates?.[to] ?? 0;
      const fs = f?.symbol ?? from;
      const ts = t?.symbol ?? to;
      return {
        categoryLabel: category.label, categoryIcon: category.icon,
        fromCode: from, toCode: to,
        fromDisplay: `${fs} ${format(value)}`, toDisplay: `${ts} ${format(converted)}`,
        notes: [from, to].filter((c, i, a) => a.indexOf(c) === i).map((c) => ({
          title: `${c} (${CURRENCY_INFO[c]?.name ?? c})`,
          text: CURRENCY_INFO[c]?.desc ?? `${c} is a world currency.`
        })),
        calcTitle: `Using the latest currency rate (${date})`,
        calcLines: from === to ? steps : [
          `1 ${from} = ${ts} ${format(rate)}`, "so,",
          `${fs} ${format(value)} × ${ts} ${format(rate)} = ${ts} ${format(converted)}`, "therefore,",
          `${fs} ${format(value)} = ${ts} ${format(converted)}`
        ],
        fileName: `flipr-${from}-to-${to}.pdf`
      };
    }
    const label = (code: string) => category.units.find((u) => u.code === code)?.label ?? code;
    const noun = NOUN[category.id] ?? category.label.toLowerCase();
    return {
      categoryLabel: category.label, categoryIcon: category.icon,
      fromCode: from, toCode: to,
      fromDisplay: `${format(value)} ${from}`, toDisplay: `${format(converted)} ${to}`,
      notes: [from, to].filter((c, i, a) => a.indexOf(c) === i).map((c) => ({
        title: `${c} (${label(c)})`,
        text: `${label(c)} (${c}) is a unit used to measure ${noun}.`
      })),
      calcTitle: "How it was calculated",
      calcLines: steps,
      fileName: `flipr-${category.id}-${from}-to-${to}.pdf`
    };
  }

  async function download() {
    if (!user) { onNeedLogin(); return; }
    if (!result || parsed === null) return;
    setBusy(true); setPdfError(null);
    try {
      await downloadResultPdf(buildReport(parsed, result.value, result.steps));
      addHistory(user.email, { categoryId: category.id, from, to, amount: format(parsed), result: format(result.value) })
        .then(() => setSaved(true))
        .catch(() => { /* history is a bonus; the download already worked */ });
    } catch {
      setPdfError("Couldn’t create the PDF. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const hint = parsed === null ? "Input amount to convert" : invalid ? "Enter a valid number" : rateError;

  return (
    <>
      <div className="field-block">
        <div className="convert-box">
          <div className={`input-row${invalid ? " invalid" : ""}`}>
            <span className="leading"><span className="glyph-123" aria-hidden>123</span></span>
            <input inputMode="decimal" placeholder="Enter amount" value={amount} onChange={(e) => { setAmount(e.target.value); setSaved(false); }} aria-label="Amount to convert" />
            {amount && (
              <button type="button" className="trailing" onClick={() => { setAmount(""); setSaved(false); }} aria-label="Clear amount"><ClearIcon /></button>
            )}
          </div>
          <select className="unit-select" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="Convert from">
            {unitCodes.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <span />
          <button className="swap-btn" onClick={() => { setFrom(to); setTo(from); }} aria-label="Swap units"><SwapIcon /></button>
          <div className="input-row" aria-live="polite">
            <span className="leading"><ConvertGlyphIcon /></span>
            <input readOnly placeholder={loadingRates ? "Loading rates…" : "Converted amount"} value={result ? format(result.value) : ""} aria-label="Converted amount" />
          </div>
          <select className="unit-select" value={to} onChange={(e) => setTo(e.target.value)} aria-label="Convert to">
            {unitCodes.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {hint && <div className="banner warning" role="status"><WarningFilledIcon />{hint}</div>}

      {result && (
        <div className="field-block" aria-label="How it was calculated">
          <span className="field-label">How it works</span>
          {result.steps.map((s, i) => <span key={i} style={{ fontSize: 12 }}>{s}</span>)}
        </div>
      )}

      {pdfError && <div className="banner error" role="alert"><WarningFilledIcon />{pdfError}</div>}
      {saved && <div className="banner success" role="status">Saved to your History.</div>}

      <div className="download-zone">
        {!user && <span>Login/Sign up to download your result</span>}
        <button className="btn btn-primary" onClick={() => void download()} disabled={(!!user && !result) || busy}>{busy ? "Preparing PDF…" : "Download Result"}</button>
      </div>
    </>
  );
}
