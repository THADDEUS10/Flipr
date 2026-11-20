import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { LANGUAGES, MAX_CHARS, describeTranslateError, extractText, languageName, translateText } from "../lib/translate";
import { downloadTranslationPdf } from "../lib/resultPdf";
import { formatBytes } from "../lib/files";
import { describeSpeechError, getRecognizer, speechLocale, type Recognizer } from "../lib/speech";
import { Dropdown } from "./Dropdown";
import { AlertIcon, CheckIcon, FileIcon, SwapIcon, UploadIcon } from "./Icons";
import { usePremium } from "../context/PremiumContext";
import { DownloadNote } from "./DownloadNote";

type Mode = "text" | "document" | "audio";
type Stage = "idle" | "reading" | "ready" | "working" | "done";
const DOC_EXT = [".txt", ".docx", ".pdf"];
const MAX_FILE = 20 * 1024 * 1024;
const MicIcon = ({ size = 30 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
);
const OPTIONS = LANGUAGES.map((l) => ({ id: l.id, label: l.label }));

export function TranslatePanel({ onNeedLogin }: { onNeedLogin: () => void }) {
  const { user } = useAuth();
  const { requestDownload } = usePremium();
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

  // audio (microphone) mode
  const [listening, setListening] = useState(false);
  const recRef = useRef<Recognizer | null>(null);
  const baseRef = useRef("");
  const speechSupported = getRecognizer() !== null;

  function stopListening() {
    recRef.current?.stop();
  }

  function startListening() {
    const Rec = getRecognizer();
    if (!Rec) return;
    setError(null);
    baseRef.current = text.trim() ? text.trim() + " " : "";
    const rec = new Rec();
    rec.lang = speechLocale(from);
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let heard = "";
      for (let i = 0; i < e.results.length; i++) heard += e.results[i][0].transcript;
      setText((baseRef.current + heard).slice(0, MAX_CHARS + 50));
    };
    rec.onerror = (e) => { setError(describeSpeechError(String(e.error))); };
    rec.onend = () => { setListening(false); recRef.current = null; };
    recRef.current = rec;
    try { rec.start(); setListening(true); } catch { setListening(false); setError(describeSpeechError("unknown")); }
  }

  // stop listening when you leave the Audio tab, change the spoken language, or close the panel
  useEffect(() => { recRef.current?.abort(); }, [mode, from]);
  useEffect(() => () => { recRef.current?.abort(); }, []);

  // Live translation while typing (waits a moment after you stop)
  useEffect(() => {
    if (mode === "document") return;
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
    if (mode !== "document" && translated) setText(translated);
  }

  async function copy() {
    try { await navigator.clipboard.writeText(translated); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ }
  }

  async function downloadText() {
    if (!user) { onNeedLogin(); return; }
    if (!translated) return;
    if (!(await requestDownload())) return;
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
    if (!(await requestDownload())) return;
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
          <button role="tab" aria-selected={mode === "audio"} className={`tab${mode === "audio" ? " active" : ""}`} onClick={() => setMode("audio")}>Audio</button>
        </div>
        <div className="lang-grid">
          <div><span className="field-label">From</span><Dropdown options={OPTIONS} value={from} onChange={setFrom} /></div>
          <button className="swap-btn" onClick={swap} aria-label="Swap languages"><SwapIcon /></button>
          <div><span className="field-label">To</span><Dropdown options={OPTIONS} value={to} onChange={setTo} /></div>
        </div>
      </div>

      {mode !== "document" ? (
        <>
          {mode === "audio" && (
            <div className="field-block">
              <span className="field-label">Speak</span>
              <div className="mic-box">
                {speechSupported ? (
                  <>
                    <button type="button" className={`mic-btn${listening ? " live" : ""}`} onClick={listening ? stopListening : startListening} aria-label={listening ? "Stop listening" : "Start listening"} aria-pressed={listening}>
                      <MicIcon />
                    </button>
                    <span className="mic-status" aria-live="polite">{listening ? "Listening… tap to stop" : "Tap the microphone and speak"}</span>
                    <span className="mic-note">Your browser’s speech service listens. FLIPR does not record or store your voice.</span>
                  </>
                ) : (
                  <span className="mic-status">Voice input isn’t supported in this browser. Try Chrome, Edge or Safari, or use the Text tab.</span>
                )}
              </div>
            </div>
          )}
          <div className="field-block">
            <span className="field-label"><span>{mode === "audio" ? "What you said" : "Input Text"}</span><span style={{ fontWeight: 400 }}>{text.length} / {MAX_CHARS}</span></span>
            <textarea className="textarea" rows={4} placeholder={mode === "audio" ? "Your spoken words appear here" : "Enter text to translate"} value={text} onChange={(e) => setText(e.target.value)} aria-label="Text to translate" />
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
          {mode === "audio" && (
            <div className="field-block">
              <span className="field-label">Upload Audio File</span>
              <button type="button" className="file-pick" disabled title="Uploading audio files is coming later">
                <b>Choose File</b><span>Coming soon</span><span aria-hidden><UploadIcon /></span>
              </button>
            </div>
          )}
          <div className="download-zone">
            {!user && <span>Login/Sign up to download your result</span>}
            {user && <DownloadNote />}
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
            {user && <DownloadNote />}
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
