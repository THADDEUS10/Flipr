import { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { CONVERSIONS, describeError, getConversion } from "../lib/fileConvert";
import { downloadBlob, formatBytes } from "../lib/files";
import { Dropdown } from "./Dropdown";
import { AlertIcon, CheckIcon, FileIcon, UploadIcon } from "./Icons";
import { usePremium } from "../context/PremiumContext";
import { DownloadNote } from "./DownloadNote";

type Stage = "idle" | "reading" | "ready" | "working" | "done";
const MAX_BYTES = 50 * 1024 * 1024;

export function FileConvertPanel({ onNeedLogin }: { onNeedLogin: () => void }) {
  const { user } = useAuth();
  const { requestDownload } = usePremium();
  const [convId, setConvId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [pct, setPct] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const readerRef = useRef<FileReader | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const conv = getConversion(convId);

  function remove() {
    readerRef.current?.abort();
    readerRef.current = null;
    setFile(null); setStage("idle"); setPct(0); setError(null); setSummary(null);
  }

  function pickType(id: string) { remove(); setConvId(id); }

  function choose(f: File) {
    remove();
    if (!conv) return;
    const lower = f.name.toLowerCase();
    if (!conv.accept.some((ext) => lower.endsWith(ext))) {
      setError(`${conv.label} needs a ${conv.accept.join(" or ")} file.`);
      return;
    }
    if (f.size > MAX_BYTES) { setError("That file is over 50 MB. Try a smaller one."); return; }
    setFile(f); setStage("reading");
    const r = new FileReader();
    readerRef.current = r;
    r.onprogress = (e) => { if (e.lengthComputable) setPct(Math.round((e.loaded / e.total) * 100)); };
    r.onload = () => { setPct(100); setStage("ready"); };
    r.onerror = () => { setError("Couldn’t read that file."); setFile(null); setStage("idle"); };
    r.readAsArrayBuffer(f);
  }

  async function convert() {
    if (!file || !conv) return;
    if (!user) { onNeedLogin(); return; }
    if (!(await requestDownload())) return;
    setStage("working"); setError(null); setSummary(null);
    try {
      const out = await conv.run(file);
      downloadBlob(out.blob, out.name);
      setSummary(`Done: ${out.name} (${formatBytes(out.blob.size)}).`);
      setStage("done");
    } catch (err) {
      setError(describeError(err));
      setStage("ready");
    }
  }

  const complete = stage === "ready" || stage === "working" || stage === "done";

  return (
    <>
      <div className="field-block">
        <span className="field-label">File Conversion Type</span>
        <Dropdown options={CONVERSIONS.map((c) => ({ id: c.id, label: c.label }))} value={convId} onChange={pickType} placeholder="Select conversion type" />
        {conv?.note && <span className="field-hint">{conv.note}</span>}
      </div>

      <div className="field-block">
        <span className="field-label">Upload File</span>
        {!file ? (
          <button type="button" className="file-pick" disabled={!conv} onClick={() => inputRef.current?.click()}
            title={conv ? undefined : "Choose a conversion type first"}>
            <b>Choose File</b><span>{conv ? "No file chosen" : "Pick a conversion type first"}</span><span aria-hidden><UploadIcon /></span>
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
              <button type="button" className="chip-btn danger" onClick={remove}>{stage === "reading" ? "Cancel" : "Remove"}</button>
            </div>
          </div>
        )}
        <input ref={inputRef} type="file" hidden accept={conv?.accept.join(",")}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) choose(f); e.target.value = ""; }} />
        {error && <div className="field-error" role="alert"><AlertIcon />{error}</div>}
      </div>

      {summary && <div className="banner success" role="status">{summary}</div>}

      <div className="download-zone">
        {!user && <span>Login/Sign up to download your result</span>}
        {user && <DownloadNote />}
        <button className="btn btn-primary" onClick={() => void convert()} disabled={!file || stage === "reading" || stage === "working"}>
          {stage === "working" ? "Converting…" : "Convert & Download Result"}
        </button>
        <span style={{ fontSize: 10 }}>Everything is converted on your device. Your files are never uploaded.</span>
      </div>
    </>
  );
}
