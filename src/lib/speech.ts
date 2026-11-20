// Voice input uses the browser's built-in speech recognition (Web Speech API).
// FLIPR never records or stores your voice. In Chrome the browser's speech service (Google) does the listening.

export interface Recognizer {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: any) => void) | null; // eslint-disable-line @typescript-eslint/no-explicit-any
  onerror: ((e: any) => void) | null; // eslint-disable-line @typescript-eslint/no-explicit-any
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

export function getRecognizer(): (new () => Recognizer) | null {
  const w = window as unknown as { SpeechRecognition?: new () => Recognizer; webkitSpeechRecognition?: new () => Recognizer };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Our language ids -> locale codes the speech service understands. */
const LOCALES: Record<string, string> = {
  en: "en-US", es: "es-ES", fr: "fr-FR", ar: "ar-SA", it: "it-IT", de: "de-DE", pt: "pt-BR",
  "zh-CN": "zh-CN", ja: "ja-JP", ko: "ko-KR", hi: "hi-IN", ru: "ru-RU", tr: "tr-TR", sw: "sw-KE",
  yo: "yo-NG", ig: "ig-NG", ha: "ha-NG", nl: "nl-NL", pl: "pl-PL", id: "id-ID", vi: "vi-VN",
  th: "th-TH", uk: "uk-UA", el: "el-GR", he: "he-IL", bn: "bn-BD", ur: "ur-PK"
};
export const speechLocale = (id: string) => LOCALES[id] ?? id;

export function describeSpeechError(code: string): string {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed": return "Microphone access is blocked. Allow the microphone for this site in your browser settings, then try again.";
    case "no-speech": return "I didn’t hear anything. Tap the microphone and try again.";
    case "audio-capture": return "No microphone was found on this device.";
    case "language-not-supported": return "Your browser can’t listen in this language yet. Try another language, or type the text instead.";
    case "network": return "Voice input needs an internet connection. Please check yours and try again.";
    default: return "Voice input stopped. Please try again.";
  }
}
