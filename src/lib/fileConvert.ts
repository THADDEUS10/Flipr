// File conversions that run entirely in the browser (nothing is uploaded).

export interface ConvResult { blob: Blob; name: string }
export interface Conversion {
  id: string;
  label: string;
  accept: string[];            // allowed file extensions, lowercase
  run: (file: File) => Promise<ConvResult>;
  note?: string;               // shown under the dropdown
}

const base = (name: string) => name.replace(/\.[^.]+$/, "");
const IMG = [".png", ".jpg", ".jpeg", ".webp"];

async function drawToCanvas(file: File, fill?: string): Promise<HTMLCanvasElement> {
  const bmp = await createImageBitmap(file);
  const c = document.createElement("canvas");
  c.width = bmp.width; c.height = bmp.height;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("canvas");
  if (fill) { ctx.fillStyle = fill; ctx.fillRect(0, 0, c.width, c.height); }
  ctx.drawImage(bmp, 0, 0);
  return c;
}

function canvasBlob(c: HTMLCanvasElement, type: string, q?: number): Promise<Blob> {
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("encode"))), type, q));
}

const imageTo = (mime: string, ext: string) => async (file: File): Promise<ConvResult> => {
  const c = await drawToCanvas(file, mime === "image/jpeg" ? "#ffffff" : undefined);
  return { blob: await canvasBlob(c, mime, 0.92), name: `${base(file.name)}.${ext}` };
};

async function imageToPdf(file: File): Promise<ConvResult> {
  const { jsPDF } = await import("jspdf");
  const c = await drawToCanvas(file, "#ffffff");
  const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: c.width > c.height ? "landscape" : "portrait" });
  const pw = pdf.internal.pageSize.getWidth();
  const ph = pdf.internal.pageSize.getHeight();
  const m = 24;
  const scale = Math.min((pw - 2 * m) / c.width, (ph - 2 * m) / c.height);
  const w = c.width * scale, h = c.height * scale;
  pdf.addImage(c.toDataURL("image/jpeg", 0.92), "JPEG", (pw - w) / 2, (ph - h) / 2, w, h);
  return { blob: pdf.output("blob"), name: `${base(file.name)}.pdf` };
}

async function textToPdf(file: File): Promise<ConvResult> {
  const { jsPDF } = await import("jspdf");
  const text = await file.text();
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  pdf.setFont("courier", "normal");
  pdf.setFontSize(11);
  const m = 48, lh = 15;
  const pw = pdf.internal.pageSize.getWidth();
  const ph = pdf.internal.pageSize.getHeight();
  const lines = pdf.splitTextToSize(text, pw - 2 * m) as string[];
  let y = m;
  for (const line of lines) {
    if (y > ph - m) { pdf.addPage(); y = m; }
    pdf.text(line, m, y);
    y += lh;
  }
  return { blob: pdf.output("blob"), name: `${base(file.name)}.pdf` };
}

async function wordToPdf(file: File): Promise<ConvResult> {
  const [mammoth, { default: html2canvas }, { jsPDF }] = await Promise.all([import("mammoth"), import("html2canvas"), import("jspdf")]);
  const { value } = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });

  const holder = document.createElement("div");
  holder.style.cssText = "position:fixed;left:-10000px;top:0;width:700px;padding:40px;background:#fff;color:#000;font:14px/1.6 Arial,sans-serif;box-sizing:border-box;";
  holder.innerHTML = value; // mammoth builds this HTML itself from the document structure
  holder.querySelectorAll("img").forEach((i) => { (i as HTMLImageElement).style.maxWidth = "100%"; });
  holder.querySelectorAll("table").forEach((t) => { (t as HTMLElement).style.cssText = "border-collapse:collapse;width:100%;"; });
  holder.querySelectorAll("td,th").forEach((t) => { (t as HTMLElement).style.cssText = "border:1px solid #bbb;padding:4px 6px;"; });
  document.body.append(holder);

  try {
    const canvas = await html2canvas(holder, { scale: 2, backgroundColor: "#ffffff" });
    const pageW = 595.28, pageH = 841.89;
    const pxPerPt = canvas.width / pageW;
    const sliceH = Math.floor(pageH * pxPerPt);
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    for (let y = 0, i = 0; y < canvas.height; y += sliceH, i++) {
      const h = Math.min(sliceH, canvas.height - y);
      const slice = document.createElement("canvas");
      slice.width = canvas.width; slice.height = h;
      const sctx = slice.getContext("2d");
      if (!sctx) throw new Error("canvas");
      sctx.fillStyle = "#fff"; sctx.fillRect(0, 0, slice.width, h);
      sctx.drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h);
      if (i > 0) pdf.addPage();
      pdf.addImage(slice.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, pageW, h / pxPerPt);
    }
    return { blob: pdf.output("blob"), name: `${base(file.name)}.pdf` };
  } finally {
    holder.remove();
  }
}

async function pdfToWord(file: File): Promise<ConvResult> {
  const pdfjs = await import("pdfjs-dist");
  const worker = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = worker;
  const { Document, Packer, Paragraph, TextRun } = await import("docx");

  const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const paragraphs: InstanceType<typeof Paragraph>[] = [];
  let anyText = false;

  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const lines: string[] = [];
    let line = "";
    let lastY: number | null = null;
    for (const item of content.items) {
      if (!("str" in item)) continue;
      const y = item.transform[5] as number;
      if (lastY !== null && Math.abs(y - lastY) > 2) { lines.push(line); line = ""; }
      line += item.str;
      lastY = y;
    }
    if (line) lines.push(line);
    lines.forEach((l, i) => {
      if (l.trim()) anyText = true;
      paragraphs.push(new Paragraph({ pageBreakBefore: p > 1 && i === 0, children: [new TextRun(l)] }));
    });
  }
  if (!anyText) throw new Error("NO_TEXT");

  const blob = await Packer.toBlob(new Document({ sections: [{ children: paragraphs }] }));
  return { blob, name: `${base(file.name)}.docx` };
}

// ---- CSV <-> JSON ----
function parseCsv(input: string): string[][] {
  const text = input.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else quoted = false; }
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = ""; rows.push(row); row = [];
    } else cell += ch;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c !== ""));
}

async function csvToJson(file: File): Promise<ConvResult> {
  const rows = parseCsv(await file.text());
  if (rows.length < 1) throw new Error("EMPTY");
  const [head, ...rest] = rows;
  const data = rest.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ""])));
  return { blob: new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), name: `${base(file.name)}.json` };
}

async function jsonToCsv(file: File): Promise<ConvResult> {
  let data: unknown;
  try { data = JSON.parse(await file.text()); } catch { throw new Error("BAD_JSON"); }
  const list = Array.isArray(data) ? data : [data];
  const objs = list.filter((x): x is Record<string, unknown> => typeof x === "object" && x !== null && !Array.isArray(x));
  if (objs.length === 0) throw new Error("BAD_JSON");
  const keys = Array.from(new Set(objs.flatMap((o) => Object.keys(o))));
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [keys.join(","), ...objs.map((o) => keys.map((k) => esc(o[k])).join(","))].join("\n");
  return { blob: new Blob([csv], { type: "text/csv" }), name: `${base(file.name)}.csv` };
}

export const CONVERSIONS: Conversion[] = [
  { id: "pdf-docx", label: "PDF to Word", accept: [".pdf"], run: pdfToWord, note: "Text only: pictures and layout aren’t kept, and scanned PDFs won’t work." },
  { id: "docx-pdf", label: "Word to PDF", accept: [".docx"], run: wordToPdf, note: "Works best on simple documents. Complex layouts may look different." },
  { id: "image-pdf", label: "Image to PDF", accept: IMG, run: imageToPdf },
  { id: "txt-pdf", label: "Text to PDF", accept: [".txt"], run: textToPdf, note: "Plain English text. Other alphabets aren’t supported yet." },
  { id: "png-jpg", label: "PNG to JPG", accept: [".png"], run: imageTo("image/jpeg", "jpg") },
  { id: "jpg-png", label: "JPG to PNG", accept: [".jpg", ".jpeg"], run: imageTo("image/png", "png") },
  { id: "png-webp", label: "PNG to WebP", accept: [".png"], run: imageTo("image/webp", "webp") },
  { id: "jpg-webp", label: "JPG to WebP", accept: [".jpg", ".jpeg"], run: imageTo("image/webp", "webp") },
  { id: "webp-png", label: "WebP to PNG", accept: [".webp"], run: imageTo("image/png", "png") },
  { id: "webp-jpg", label: "WebP to JPG", accept: [".webp"], run: imageTo("image/jpeg", "jpg") },
  { id: "csv-json", label: "CSV to JSON", accept: [".csv"], run: csvToJson },
  { id: "json-csv", label: "JSON to CSV", accept: [".json"], run: jsonToCsv, note: "Needs a list of objects, like [{…}, {…}]." }
];

export function getConversion(id: string): Conversion | undefined {
  return CONVERSIONS.find((c) => c.id === id);
}

export function describeError(err: unknown): string {
  const msg = err instanceof Error ? err.message : "";
  if (msg === "NO_TEXT") return "No readable text found. This looks like a scanned PDF, which can’t be converted here.";
  if (msg === "BAD_JSON") return "That JSON file isn’t a list of objects, so it can’t become a table.";
  if (msg === "EMPTY") return "That file is empty.";
  return "Something went wrong while converting. The file may be damaged or in an unsupported format.";
}
