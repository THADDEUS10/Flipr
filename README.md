# Flipr (Phase 1)

Convert anything. Understand everything. React + TypeScript + Vite, installable as a PWA.

## What's in Phase 1
- Design tokens from the Figma file (colors, Bree Serif + Roboto), light and dark mode
- Responsive layout that works on phone and desktop
- Landing page with a working converter: currency (live rates), temperature, weight, length, area, water/volume, time, energy
- "How it works" step-by-step explanation, and a downloadable result (login required, as in the design)
- Sign in, Sign up, and a 3-step Reset password flow, with the error states from the design
- Demo mode (no setup) or real accounts with Supabase
- PWA: installable, works offline for unit conversions

## Run it
```bash
npm install
npm run dev
```
Open the address shown (for example http://localhost:5173). On the same Wi-Fi, open the "Network" address on your phone to test the mobile view.

## Real accounts (optional)
1. Create a free project at supabase.com.
2. Copy `.env.example` to `.env` and fill in the URL and anon key (Settings -> API).
3. In Supabase, turn on Email auth, and Google under Authentication -> Providers if you want it.
Without these, the app runs in demo mode: any valid email and password signs you in, and the reset code is 123456.

## Install as an app
Build with `npm run build`, deploy the `dist` folder (Netlify, Vercel or Cloudflare Pages are free), then use "Add to Home Screen" on your phone or "Install" in a desktop browser.

## Phase 2 (added)
- QR code: generate + download, scan with camera or image file (camera needs https or localhost)
- File compression: images re-encoded smaller, other files zipped, all in the browser

## Phase 3 (added)
- History page (menu -> History): Bookmarks and Recent, grouped by month, Apply / bookmark / delete
- Logged-in users save a conversion by pressing Download Result on the unit/currency converter
- Demo mode keeps history in this browser. With Supabase, run `supabase/schema.sql` once (SQL Editor) so history is saved to the account

## Phase 4 (added)
- Download Result is now a PDF styled like the Figma "Downloaded Result" (logo, From/To box, currency or unit explanations, rate and calculation box)
- Change `SITE_URL` in `src/lib/resultPdf.ts` to your real website address
- Add more currency descriptions in `src/lib/currencyInfo.ts`

## Phase 5 (added)
- File Conversion (all in the browser): PDF to Word (text only), Word to PDF (simple documents), Image to PDF, Text to PDF, PNG/JPG/WebP conversions, CSV to JSON, JSON to CSV
- Video conversion (MKV/MP4) is not included: it needs a server or a very large in-browser engine

## Phase 6 (added)
- Language Translation: Text and Document (.txt, .docx, .pdf) tabs, From/To language lists, swap, copy, and a PDF result
- Uses the free MyMemory service: it has a daily limit. Put a real email in `VITE_MYMEMORY_EMAIL` (in `.env`) to raise it
- Audio translation is not included yet (it needs speech recognition)

## Next phases
File conversion, language translation, payments.
