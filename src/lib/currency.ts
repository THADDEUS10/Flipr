// Live exchange rates from open.er-api.com (free, no API key).
const cache = new Map<string, { rates: Record<string, number>; time: number }>();
const TTL = 1000 * 60 * 30; // 30 minutes

export const POPULAR_CURRENCIES = [
  "USD", "EUR", "GBP", "NGN", "GHS", "KES", "ZAR", "EGP", "CAD", "AUD",
  "INR", "CNY", "JPY", "AED", "SAR", "BRL", "MXN", "CHF", "TRY", "RUB"
];

export async function getRates(base: string): Promise<Record<string, number>> {
  const hit = cache.get(base);
  if (hit && Date.now() - hit.time < TTL) return hit.rates;
  const res = await fetch(`https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`);
  if (!res.ok) throw new Error("Could not load exchange rates.");
  const data = (await res.json()) as { result?: string; rates?: Record<string, number> };
  if (data.result !== "success" || !data.rates) throw new Error("Could not load exchange rates.");
  cache.set(base, { rates: data.rates, time: Date.now() });
  return data.rates;
}
