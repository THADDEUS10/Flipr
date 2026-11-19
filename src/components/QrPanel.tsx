import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import jsQR from "jsqr";
import { useAuth } from "../context/AuthContext";
import { downloadDataUrl } from "../lib/files";
import { AlertIcon } from "./Icons";

export function QrPanel({ onNeedLogin }: { onNeedLogin: () => void }) {
  const { user } = useAuth();

  // ---- Generate ----
  const [text, setText] = useState("");
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  async function generate() {
    const value = text.trim();
    if (!value) { setGenError("Enter text, a URL, or data."); setQrUrl(null); return; }
    try {
      setGenError(null);
      setQrUrl(await QRCode.toDataURL(value, { width: 512, margin: 2, errorCorrectionLevel: "M" }));
    } catch {
      setGenError("That’s too long to fit in a QR code. Try something shorter.");
      setQrUrl(null);
    }
  }

  function download() {
    if (!user) { onNeedLogin(); return; }
    if (qrUrl) downloadDataUrl(qrUrl, "flipr-qr-code.png");
  }

  // ---- Scan ----
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  }, []);

  useEffect(() => stop, [stop]); // stop the camera when leaving this panel

  async function start() {
    setScanError(null); setScanned(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setScanError("Camera access needs a secure (https) page. Try “Scan Image File” instead.");
      return;
    }
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } } });
      setScanning(true);
    } catch {
      setScanError("Couldn’t access the camera. Allow camera permission and try again.");
    }
  }

  useEffect(() => {
    if (!scanning) return;
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!video || !stream) return;
    video.srcObject = stream;
    video.play().catch(() => { /* autoplay blocked, user can tap */ });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const tick = () => {
      if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(img.data, img.width, img.height);
        if (code?.data) { setScanned(code.data); stop(); return; }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [scanning, stop]);

  async function scanFile(file: File) {
    setScanError(null); setScanned(null);
    try {
      const bmp = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = bmp.width; canvas.height = bmp.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { setScanError("Couldn’t read that image."); return; }
      ctx.drawImage(bmp, 0, 0);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(data.data, data.width, data.height);
      if (code?.data) setScanned(code.data); else setScanError("No QR code found in that image.");
    } catch {
      setScanError("Couldn’t read that image.");
    }
  }

  async function copy() {
    if (!scanned) return;
    try { await navigator.clipboard.writeText(scanned); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ }
  }

  const isLink = scanned !== null && /^https?:\/\//i.test(scanned);

  return (
    <>
      <div className="field-block">
        <span className="field-label">Generate QR Code</span>
        <div className={`input-row${genError ? " invalid" : ""}`}>
          <input placeholder="Enter text, URL, or data" value={text} onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void generate(); }} aria-label="Text or URL for the QR code" />
        </div>
        {genError && <div className="field-error" role="alert"><AlertIcon />{genError}</div>}
        <button className="btn btn-primary" onClick={() => void generate()}>Generate QR Code</button>
        {qrUrl && (
          <>
            <img className="qr-img" src={qrUrl} alt="Generated QR code" />
            {!user && <span className="guest-note">Login/Sign up to download your QR code</span>}
            <button className="btn btn-soft" onClick={download}>Download</button>
          </>
        )}
      </div>

      <div className="field-block">
        <span className="field-label">Scan QR Code</span>
        {scanning ? (
          <>
            <video ref={videoRef} className="scan-video" playsInline muted />
            <button className="btn btn-red" onClick={stop}>Stop Scanning</button>
          </>
        ) : (
          <button className="btn btn-primary" onClick={() => void start()}>Start Camera Scanner</button>
        )}
        <button className="btn btn-soft" onClick={() => fileRef.current?.click()}>Scan Image File</button>
        <input ref={fileRef} type="file" accept="image/*" hidden
          onChange={(e) => { const f = e.target.files?.[0]; if (f) void scanFile(f); e.target.value = ""; }} />
        {scanError && <div className="field-error" role="alert"><AlertIcon />{scanError}</div>}
        {scanned && (
          <div className="scan-result" aria-live="polite">
            <span className="chip-text">{scanned}</span>
            <div className="chip-actions">
              <button className="chip-btn" onClick={() => void copy()}>{copied ? "Copied" : "Copy"}</button>
              {isLink && <a className="chip-btn" href={scanned} target="_blank" rel="noopener noreferrer">Open</a>}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
