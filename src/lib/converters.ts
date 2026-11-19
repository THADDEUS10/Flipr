// Offline unit conversions. Currency is handled separately (needs live rates).

export interface UnitDef {
  code: string;
  label: string;
  /** How many base units one of this unit equals (not used for temperature) */
  factor: number;
}

export interface Category {
  id: string;
  label: string;
  icon: string;
  kind: "units" | "temperature" | "currency" | "qr" | "compression" | "conversion" | "translation";
  units: UnitDef[];
}

export const CATEGORIES: Category[] = [
  { id: "currency", label: "Currency", icon: "currency", kind: "currency", units: [] },
  { id: "qr", label: "QR Code", icon: "qr", kind: "qr", units: [] },
  { id: "compression", label: "File Compression", icon: "compression", kind: "compression", units: [] },
  { id: "conversion", label: "File Conversion", icon: "conversion", kind: "conversion", units: [] },
  { id: "translation", label: "Language Translation", icon: "translation", kind: "translation", units: [] },
  {
    id: "temperature", label: "Temperature", icon: "temperature", kind: "temperature",
    units: [
      { code: "C", label: "Celsius", factor: 1 },
      { code: "F", label: "Fahrenheit", factor: 1 },
      { code: "K", label: "Kelvin", factor: 1 }
    ]
  },
  {
    id: "weight", label: "Weight", icon: "weight", kind: "units",
    units: [
      { code: "kg", label: "Kilogram", factor: 1 },
      { code: "g", label: "Gram", factor: 0.001 },
      { code: "mg", label: "Milligram", factor: 0.000001 },
      { code: "lb", label: "Pound", factor: 0.45359237 },
      { code: "oz", label: "Ounce", factor: 0.028349523125 },
      { code: "t", label: "Metric ton", factor: 1000 }
    ]
  },
  {
    id: "length", label: "Length", icon: "length", kind: "units",
    units: [
      { code: "m", label: "Metre", factor: 1 },
      { code: "km", label: "Kilometre", factor: 1000 },
      { code: "cm", label: "Centimetre", factor: 0.01 },
      { code: "mm", label: "Millimetre", factor: 0.001 },
      { code: "mi", label: "Mile", factor: 1609.344 },
      { code: "yd", label: "Yard", factor: 0.9144 },
      { code: "ft", label: "Foot", factor: 0.3048 },
      { code: "in", label: "Inch", factor: 0.0254 }
    ]
  },
  {
    id: "area", label: "Area", icon: "area", kind: "units",
    units: [
      { code: "m²", label: "Square metre", factor: 1 },
      { code: "km²", label: "Square kilometre", factor: 1_000_000 },
      { code: "ha", label: "Hectare", factor: 10_000 },
      { code: "ac", label: "Acre", factor: 4046.8564224 },
      { code: "ft²", label: "Square foot", factor: 0.09290304 },
      { code: "in²", label: "Square inch", factor: 0.00064516 }
    ]
  },
  {
    id: "volume", label: "Water / Volume", icon: "volume", kind: "units",
    units: [
      { code: "L", label: "Litre", factor: 1 },
      { code: "mL", label: "Millilitre", factor: 0.001 },
      { code: "m³", label: "Cubic metre", factor: 1000 },
      { code: "gal", label: "US gallon", factor: 3.785411784 },
      { code: "qt", label: "US quart", factor: 0.946352946 },
      { code: "cup", label: "US cup", factor: 0.2365882365 }
    ]
  },
  {
    id: "time", label: "Time", icon: "time", kind: "units",
    units: [
      { code: "s", label: "Second", factor: 1 },
      { code: "min", label: "Minute", factor: 60 },
      { code: "h", label: "Hour", factor: 3600 },
      { code: "day", label: "Day", factor: 86400 },
      { code: "wk", label: "Week", factor: 604800 }
    ]
  },
  {
    id: "energy", label: "Energy", icon: "energy", kind: "units",
    units: [
      { code: "J", label: "Joule", factor: 1 },
      { code: "kJ", label: "Kilojoule", factor: 1000 },
      { code: "cal", label: "Calorie", factor: 4.184 },
      { code: "kcal", label: "Kilocalorie", factor: 4184 },
      { code: "Wh", label: "Watt-hour", factor: 3600 },
      { code: "kWh", label: "Kilowatt-hour", factor: 3_600_000 }
    ]
  }
];

export function getCategory(id: string): Category {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}

function toCelsius(v: number, from: string): number {
  if (from === "F") return ((v - 32) * 5) / 9;
  if (from === "K") return v - 273.15;
  return v;
}
function fromCelsius(c: number, to: string): number {
  if (to === "F") return (c * 9) / 5 + 32;
  if (to === "K") return c + 273.15;
  return c;
}

export interface ConversionResult {
  value: number;
  /** Plain-language explanation of how the answer was reached */
  steps: string[];
}

export function convertUnits(category: Category, amount: number, from: string, to: string): ConversionResult {
  if (category.kind === "temperature") {
    const c = toCelsius(amount, from);
    const out = fromCelsius(c, to);
    const steps =
      from === to
        ? ["Both units are the same, so the value does not change."]
        : [
            `Start with ${amount} °${from}.`,
            from === "C" ? "It is already in Celsius." : from === "F" ? "Convert to Celsius: (°F − 32) × 5 ÷ 9." : "Convert to Celsius: K − 273.15.",
            `That gives ${format(c)} °C.`,
            to === "C" ? "Celsius is the target, so we are done." : to === "F" ? "Convert to Fahrenheit: °C × 9 ÷ 5 + 32." : "Convert to Kelvin: °C + 273.15.",
            `Result: ${format(out)} °${to}.`
          ];
    return { value: out, steps };
  }
  const f = category.units.find((u) => u.code === from);
  const t = category.units.find((u) => u.code === to);
  if (!f || !t) return { value: NaN, steps: [] };
  const base = amount * f.factor;
  const out = base / t.factor;
  const steps =
    from === to
      ? ["Both units are the same, so the value does not change."]
      : [
          `Start with ${amount} ${f.code} (${f.label.toLowerCase()}).`,
          `Convert to the base unit by multiplying by ${format(f.factor)}: ${format(base)}.`,
          `Convert to ${t.code} by dividing by ${format(t.factor)}.`,
          `Result: ${format(out)} ${t.code}.`
        ];
  return { value: out, steps };
}

export function format(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs !== 0 && (abs < 0.0001 || abs >= 1e12)) return n.toExponential(4);
  return Number(n.toPrecision(10)).toLocaleString("en-US", { maximumFractionDigits: 8 });
}
