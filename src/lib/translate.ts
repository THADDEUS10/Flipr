// Free machine translation through MyMemory (no API key). Daily limits apply.

export const MAX_CHARS = 4000;

export const LANGUAGES: Array<{ id: string; label: string }> = [
  { id: "en", label: "English" }, { id: "es", label: "Spanish" }, { id: "fr", label: "French" },
  { id: "ar", label: "Arabic" }, { id: "it", label: "Italian" }, { id: "de", label: "German" },
  { id: "pt", label: "Portuguese" }, { id: "zh-CN", label: "Chinese (Simplified)" }, { id: "ja", label: "Japanese" },
  { id: "ko", label: "Korean" }, { id: "hi", label: "Hindi" }, { id: "ru", label: "Russian" },
  { id: "tr", label: "Turkish" }, { id: "sw", label: "Swahili" }, { id: "yo", label: "Yoruba" },
  { id: "ig", label: "Igbo" }, { id: "ha", label: "Hausa" }, { id: "nl", label: "Dutch" },
  { id: "pl", label: "Polish" }, { id: "id", label: "Indonesian" }, { id: "vi", label: "Vietnamese" },
  { id: "th", label: "Thai" }, { id: "uk", label: "Ukrainian" }, { id: "el", label: "Greek" },
  { id: "he", label: "Hebrew" }, { id: "bn", label: "Bengali" }, { id: "ur", label: "Urdu" }
];

export const languageName = (id: string) => LANGUAGES.find((l) => l.id === id)?.label ?? id;

const cache = new Map<string, string>();
const CHUNK = 450; // the service accepts about 500 characters per request

function decodeEntities(s: string): string {
  const t = document.createElement("textarea");
  t.innerHTML = s;
  return t.value;
}

function splitLine(line: string): string[] {
  if (line.length <= CHUNK) return [line];
  const out: string[] = [];
  let cur = "";
  for (const sentence of line.split(/(?<=[.!?。！？])\s+/)) {
    if ((cur + " " + sentence).trim().length > CHUNK) {
      if (cur) out.push(cur);
      if (sentence.length > CHUNK) {
        for (let i = 0; i < sentence.length; i += CHUNK) out.push(sentence.slice(i, i + CHUNK));
        cur = "";
      } else cur = sentence;
    } else cur = (cur + " " + sentence).trim();
  }
  if (cur) out.push(cur);
  return out;
}

async function translateChunk(q: string, from: string, to: string): Promise<string> {
  if (from === to) return q;
  const key = `${from}|${to}|${q}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;

  const email = import.meta.env.VITE_MYMEMORY_EMAIL;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(q)}&langpair=${encodeURIComponent(`${from}|${to}`)}${email ? `&de=${encodeURIComponent(email)}` : ""}`;
  let data: { responseStatus?: number | string; responseData?: { translatedText?: string } };
  try {
    const res = await fetch(url);
    data = await res.json();
  } catch {
    throw new Error("NETWORK");
  }
  const text = data.responseData?.translatedText ?? "";
  if (Number(data.responseStatus) === 429 || /MYMEMORY WARNING/i.test(text)) throw new Error("QUOTA");
  if (Number(data.responseStatus) !== 200 || !text) throw new Error("FAILED");
  const out = decodeEntities(text);
  cache.set(key, out);
  return out;
}

export async function translateText(text: string, from: string, to: string): Promise<string> {
  const lines = text.split("\n");
  const out: string[] = [];
  for (const line of lines) {
    if (!line.trim()) { out.push(""); continue; }
    const pieces = splitLine(line.trim());
    const done: string[] = [];
    for (const p of pieces) done.push(await translateChunk(p, from, to));
    out.push(done.join(" "));
  }
  return out.join("\n");
}

export async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".txt")) return file.text();
  if (name.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return value;
  }
  if (name.endsWith(".pdf")) {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
    const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    const pages: string[] = [];
    for (let p = 1; p <= doc.numPages; p++) {
      const content = await (await doc.getPage(p)).getTextContent();
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
      pages.push(lines.join("\n"));
    }
    return pages.join("\n");
  }
  throw new Error("UNSUPPORTED");
}

export function describeTranslateError(err: unknown): string {
  const msg = err instanceof Error ? err.message : "";
  if (msg === "QUOTA") return "The free translation limit for today has been reached. Please try again tomorrow.";
  if (msg === "NETWORK") return "Couldn’t reach the translation service. Check your connection and try again.";
  if (msg === "UNSUPPORTED") return "That file type isn’t supported. Use .txt, .docx or .pdf.";
  return "Couldn’t translate that. Try different text or another language pair.";
}
