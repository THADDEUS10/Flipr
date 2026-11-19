// One coloured icon per conversion type. Stored as SVG text so the same icon works
// in the app and inside the PDF result. The text below is fixed in the code (never user input).

interface Def { color: string; body: string }

const DEFS: Record<string, Def> = {
  currency: { color: "#16a34a", body: '<rect x="2.5" y="6" width="19" height="12" rx="2" fill="{c}" fill-opacity=".15"/><circle cx="12" cy="12" r="2.8"/><path d="M6 12h.01M18 12h.01"/>' },
  qr: { color: "#1e4fbc", body: '<rect x="3.5" y="3.5" width="6" height="6" rx="1" fill="{c}" fill-opacity=".15"/><rect x="14.5" y="3.5" width="6" height="6" rx="1" fill="{c}" fill-opacity=".15"/><rect x="3.5" y="14.5" width="6" height="6" rx="1" fill="{c}" fill-opacity=".15"/><path d="M14.5 14.5h2v2h-2zM18.5 14.5h2M14.5 18.5v2M18.5 18.5h2v2"/>' },
  compression: { color: "#dc2626", body: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="{c}" fill-opacity=".15"/><path d="M12 10h.01M12 13h.01M12 16h.01"/>' },
  conversion: { color: "#475569", body: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" fill="{c}" fill-opacity=".15"/><path d="M14 3v5h5M9 13h6M9 17h4"/>' },
  translation: { color: "#db2777", body: '<circle cx="12" cy="12" r="9" fill="{c}" fill-opacity=".15"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>' },
  temperature: { color: "#ef4444", body: '<path d="M10 14.5V5a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0z" fill="{c}" fill-opacity=".15"/><path d="M12 9v7"/>' },
  weight: { color: "#d97706", body: '<path d="M7 9h10l3 11H4z" fill="{c}" fill-opacity=".15"/><circle cx="12" cy="5.5" r="2.5"/>' },
  length: { color: "#2563eb", body: '<rect x="2.5" y="8.5" width="19" height="7" rx="1.5" fill="{c}" fill-opacity=".15"/><path d="M7 8.5v3M11 8.5v4M15 8.5v3M19 8.5v2"/>' },
  area: { color: "#7c3aed", body: '<rect x="4" y="4" width="16" height="16" rx="2" fill="{c}" fill-opacity=".15"/><path d="M4 12h16M12 4v16"/>' },
  volume: { color: "#0891b2", body: '<path d="M12 3s6 6.2 6 11a6 6 0 0 1-12 0c0-4.8 6-11 6-11z" fill="{c}" fill-opacity=".15"/>' },
  time: { color: "#0d9488", body: '<circle cx="12" cy="12" r="9" fill="{c}" fill-opacity=".15"/><path d="M12 7v5l3 2"/>' },
  energy: { color: "#ca8a04", body: '<path d="M13 2 4 14h7l-1 8 9-12h-7z" fill="{c}" fill-opacity=".15"/>' }
};

export function iconSvg(id: string, size = 18): string {
  const d = DEFS[id] ?? DEFS.conversion;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${d.color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d.body.replace(/\{c\}/g, d.color)}</svg>`;
}
