import { useRef, useState } from "react";
import { zipSync } from "fflate";
import { useAuth } from "../context/AuthContext";
import { downloadBlob, formatBytes } from "../lib/files";
import { AlertIcon, CheckIcon, FileIcon, UploadIcon } from "./Icons";

type Stage = "idle" | "reading" | "ready" | "working" | "done";
const MAX_BYTES = 100 * 1024 * 1024;

async function compressImage(file: File): Promise<{ blob: Blob; name: string }> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 2560 / Math.max(bmp.width, bmp.height));
  const w = Math.max(1, Math.round(bmp.width * scale));
  const h = Math.max(1, Math.round(bmp.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(bmp, 0, 0, w, h);
  const jpeg = file.type === "image/jpeg";
  const type = jpeg ? "image/jpeg" : "image/webp";
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, type, 0.7));
  if (!blob) throw new Error("encode");
  const base = file.name.replace(/\.[^.]+$/, "");
  return { blob, name: `${base}-compressed.${jpeg ? "jpg" : "webp"}` };
}

export function CompressPanel({ onNeedLogin }: { onNeedLogin: () => void }) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [pct, setPct] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const bufRef = useRef<ArrayBuffer | null>(null);
  const readerRef = useRef<FileReader | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function remove() {
    readerRef.current?.abort();
    readerRef.current = null;
    bufRef.current = null;
    setFile(null); setStage("idle"); setPct(0); setError(null); setSummary(null);
  }

  function choose(f: File) {
    remove();
    if (f.size > MAX_BYTES) { setError("That file is over 100 MB. Browser compression works best on smaller files."); return; }
    setFile(f); setStage("reading");
    const r = new FileReader();
    readerRef.current = r;
    r.onprogress = (e) => { if (e.lengthComputable) setPct(Math.round((e.loaded / e.total) * 100)); };
    r.onload = () => { bufRef.current = r.result as ArrayBuffer; setPct(100); setStage("ready"); };
    r.onerror = () => { setError("Couldn’t read that file."); setFile(null); setStage("idle"); };
    r.readAsArrayBuffer(f);
  }

  async function compress() {
    if (!file || !bufRef.current) return;
    if (!user) { onNeedLogin(); return; }
    setStage("working"); setError(null); setSummary(null);
    try {
      let blob: Blob;
      let name: string;
      if (/^image\/(jpeg|png|webp)$/.test(file.type)) {
        ({ blob, name } = await compressImage(file));
      } else {
        const zipped = zipSync({ [file.name]: new Uint8Array(bufRef.current) }, { level: 9 });
        blob = new Blob([zipped.slice().buffer as ArrayBuffer], { type: "application/zip" });
        name = `${file.name}.zip`;
      }
      if (blob.size >= file.size) {
        setSummary("This file is already well compressed, so we couldn’t make it smaller.");
        setStage("ready");
        return;
      }
      const saved = Math.round((1 - blob.size / file.size) * 100);
      setSummary(`Reduced ${formatBytes(file.size)} → ${formatBytes(blob.size)} (${saved}% smaller).`);
      downloadBlob(blob, name);
      setStage("done");
    } catch {
      setError("Something went wrong while compressing. Try a different file.");
      setStage("ready");
    }
  }

  const complete = stage === "ready" || stage === "working" || stage === "done";

  return (
    <>
      <div className="field-block">
        <span className="field-label">Upload File</span>
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
              <button type="button" className="chip-btn danger" onClick={remove}>{stage === "reading" ? "Cancel" : "Remove"}</button>
            </div>
          </div>
        )}
        <input ref={inputRef} type="file" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) choose(f); e.target.value = ""; }} />
        {error && <div className="field-error" role="alert"><AlertIcon />{error}</div>}
      </div>

      {summary && <div className={`banner ${stage === "done" ? "success" : "info"}`} role="status">{summary}</div>}

      <div className="download-zone">
        {!user && <span>Login/Sign up to download your result</span>}
        <button className="btn btn-primary" onClick={() => void compress()} disabled={!file || stage === "reading" || stage === "working"}>
          {stage === "working" ? "Compressing…" : "Compress & Download Result"}
        </button>
        <span style={{ fontSize: 10 }}>Images are re-encoded smaller. Other files are zipped. Everything stays on your device.</span>
      </div>
    </>
  );
}
