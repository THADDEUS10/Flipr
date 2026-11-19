import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { LANGUAGES, MAX_CHARS, describeTranslateError, extractText, languageName, translateText } from "../lib/translate";
import { downloadTranslationPdf } from "../lib/resultPdf";
import { formatBytes } from "../lib/files";
import { Dropdown } from "./Dropdown";
import { AlertIcon, CheckIcon, FileIcon, SwapIcon, UploadIcon } from "./Icons";

type Mode = "text" | "document";
type Stage = "idle" | "reading" | "ready" | "working" | "done";
const DOC_EXT = [".txt", ".docx", ".pdf"];
const MAX_FILE = 20 * 1024 * 1024;
const OPTIONS = LANGUAGES.map((l) => ({ id: l.id, label: l.label }));

export function TranslatePanel({ onNeedLogin }: { onNeedLogin: () => void }) {
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>("text");
  const [from, setFrom] = useState("en");
  const [to, setTo] = useState("es");

  // text mode
  const [text, setText] = useState("");
  const [translated, setTranslated] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // document mode
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [pct, setPct] = useState(0);
  const [summary, setSummary] = useState<string | null>(null);
  const readerRef = useRef<FileReader | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Live translation while typing (waits a moment after you stop)
  useEffect(() => {
    if (mode !== "text") return;
    const q = text.trim();
    setError(null);
    if (q.length < 2) { setTranslated(""); return; }
    if (q.length > MAX_CHARS) { setError(`That’s ${q.length} characters. The limit is ${MAX_CHARS}.`); setTranslated(""); return; }
    let cancelled = false;
    setBusy(true);
    const t = setTimeout(async () => {
      try {
        const r = await translateText(q, from, to);
        if (!cancelled) setTranslated(r);
      } catch (e) {
        if (!cancelled) { setError(describeTranslateError(e)); setTranslated(""); }
      } finally {
        if (!cancelled) setBusy(false);
      }
    }, 1000);
    return () => { cancelled = true; clearTimeout(t); setBusy(false); };
  }, [text, from, to, mode]);

  function swap() {
    setFrom(to); setTo(from);
    if (mode === "text" && translated) setText(translated);
  }

  async function copy() {
    try { await navigator.clipboard.writeText(translated); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ }
  }

  async function downloadText() {
    if (!user) { onNeedLogin(); return; }
    if (!translated) return;
    setBusy(true);
    try {
      await downloadTranslationPdf({ fromLabel: languageName(from), toLabel: languageName(to), original: text.trim(), translated, fileName: `flipr-translation-${from}-to-${to}.pdf` });
    } catch { setError("Couldn’t create the PDF. Please try again."); }
    finally { setBusy(false); }
  }

  // ---- documents ----
  function removeFile() {
    readerRef.current?.abort();
    readerRef.current = null;
    setFile(null); setStage("idle"); setPct(0); setError(null); setSummary(null);
  }

  function chooseFile(f: File) {
    removeFile();
    if (!DOC_EXT.some((e) => f.name.toLowerCase().endsWith(e))) { setError("Use a .txt, .docx or .pdf file."); return; }
    if (f.size > MAX_FILE) { setError("That file is over 20 MB."); return; }
    setFile(f); setStage("reading");
    const r = new FileReader();
    readerRef.current = r;
    r.onprogress = (e) => { if (e.lengthComputable) setPct(Math.round((e.loaded / e.total) * 100)); };
    r.onload = () => { setPct(100); setStage("ready"); };
    r.onerror = () => { setError("Couldn’t read that file."); setFile(null); setStage("idle"); };
    r.readAsArrayBuffer(f);
  }

  async function translateDocument() {
    if (!file) return;
    if (!user) { onNeedLogin(); return; }
    setStage("working"); setError(null); setSummary(null);
    try {
      const original = (await extractText(file)).trim();
      if (!original) { setError("No readable text found. Scanned documents can’t be translated here."); setStage("ready"); return; }
      if (original.length > MAX_CHARS) { setError(`This document has ${original.length.toLocaleString()} characters. The free limit is ${MAX_CHARS.toLocaleString()} per translation.`); setStage("ready"); return; }
      const out = await translateText(original, from, to);
      await downloadTranslationPdf({ fromLabel: languageName(from), toLabel: languageName(to), original, translated: out, fileName: `${file.name.replace(/\.[^.]+$/, "")}-${to}.pdf` });
      setSummary("Translated and downloaded.");
      setStage("done");
    } catch (e) {
      setError(describeTranslateError(e));
      setStage("ready");
    }
  }

  const complete = stage === "ready" || stage === "working" || stage === "done";

  return (
    <>
      <div className="field-block">
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={mode === "text"} className={`tab${mode === "text" ? " active" : ""}`} onClick={() => setMode("text")}>Text</button>
          <button role="tab" aria-selected={mode === "document"} className={`tab${mode === "document" ? " active" : ""}`} onClick={() => setMode("document")}>Document</button>
          <button role="tab" className="tab" disabled title="Audio translation is coming later">Audio</button>
        </div>
        <div className="lang-grid">
          <div><span className="field-label">From</span><Dropdown options={OPTIONS} value={from} onChange={setFrom} /></div>
          <button className="swap-btn" onClick={swap} aria-label="Swap languages"><SwapIcon /></button>
          <div><span className="field-label">To</span><Dropdown options={OPTIONS} value={to} onChange={setTo} /></div>
        </div>
      </div>

      {mode === "text" ? (
        <>
          <div className="field-block">
            <span className="field-label"><span>Input Text</span><span style={{ fontWeight: 400 }}>{text.length} / {MAX_CHARS}</span></span>
            <textarea className="textarea" rows={4} placeholder="Enter text to translate" value={text} onChange={(e) => setText(e.target.value)} aria-label="Text to translate" />
          </div>
          {(translated || busy) && (
            <div className="field-block">
              <span className="field-label"><span>Translation</span>
                {translated && <button className="chip-btn" onClick={() => void copy()}>{copied ? "Copied" : "Copy"}</button>}
              </span>
              <div className="textarea output" dir="auto" aria-live="polite">{busy && !translated ? "Translating…" : translated}</div>
            </div>
          )}
          {error && <div className="banner error" role="alert"><AlertIcon />{error}</div>}
          <div className="download-zone">
            {!user && <span>Login/Sign up to download your result</span>}
            <button className="btn btn-primary" onClick={() => void downloadText()} disabled={!translated || busy}>Translate &amp; Download Result</button>
            <span style={{ fontSize: 10 }}>Free machine translation, with a daily limit. Check important text yourself.</span>
          </div>
        </>
      ) : (
        <>
          <div className="field-block">
            <span className="field-label">Upload Document File</span>
            {!file ? (
              <button type="button" className="file-pick" onClick={() => inputRef.current?.click()}>
                <b>Choose File</b><span>No file chosen</span><span aria-hidden><UploadIcon /></span>
              </button>
            ) : (
              <div className="file-card">
                <div className="file-row">
                  <FileIcon size={26} />
                  <div className="file-info">
                    <div className="file-top"><span className="file-name">{file.name}</span><span className={complete ? "pct ok" : "pct"}>{complete ? <><CheckIcon size={12} /> 100%</> : `${pct}%`}</span></div>
                    <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                      <div className={`progress-bar${complete ? " ok" : ""}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="file-size">{formatBytes(file.size)}</span>
                  </div>
                </div>
                <div className="chip-actions">
                  <button type="button" className="chip-btn" onClick={() => inputRef.current?.click()}>Change</button>
                  <button type="button" className="chip-btn danger" onClick={removeFile}>{stage === "reading" ? "Cancel" : "Remove"}</button>
                </div>
              </div>
            )}
            <input ref={inputRef} type="file" hidden accept={DOC_EXT.join(",")}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) chooseFile(f); e.target.value = ""; }} />
            {error && <div className="field-error" role="alert"><AlertIcon />{error}</div>}
          </div>
          {summary && <div className="banner success" role="status">{summary}</div>}
          <div className="download-zone">
            {!user && <span>Login/Sign up to download your result</span>}
            <button className="btn btn-primary" onClick={() => void translateDocument()} disabled={!file || stage === "reading" || stage === "working"}>
              {stage === "working" ? "Translating…" : "Translate & Download Result"}
            </button>
            <span style={{ fontSize: 10 }}>Works with .txt, .docx and .pdf that contain text, up to {MAX_CHARS.toLocaleString()} characters.</span>
          </div>
        </>
      )}
    </>
  );
}
