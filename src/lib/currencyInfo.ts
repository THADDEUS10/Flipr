export interface CurrencyInfo { name: string; symbol: string; desc: string }

// Text shown in the downloaded result. Add more currencies here as you add them to POPULAR_CURRENCIES.
export const CURRENCY_INFO: Record<string, CurrencyInfo> = {
  USD: { name: "United States Dollar", symbol: "$", desc: "It is the official currency of the United States, symbolized as “$”. It represents global economic power, serves as the world’s primary reserve currency, and is widely used in international trade and finance." },
  EUR: { name: "Euro", symbol: "€", desc: "It is the shared currency of most European Union countries, symbolized as “€”. It is the second most traded currency in the world and is used by over 300 million people." },
  GBP: { name: "British Pound Sterling", symbol: "£", desc: "It is the official currency of the United Kingdom, symbolized as “£”. It is one of the oldest currencies still in use and is widely traded on global markets." },
  NGN: { name: "Nigerian Naira", symbol: "₦", desc: "It is the official currency of Nigeria, symbolized as “₦”. It is used for trade and daily transactions across Africa’s most populous country." },
  GHS: { name: "Ghanaian Cedi", symbol: "GH₵", desc: "It is the official currency of Ghana, symbolized as “GH₵”. It is used for everyday payments and trade across Ghana." },
  KES: { name: "Kenyan Shilling", symbol: "KSh", desc: "It is the official currency of Kenya, symbolized as “KSh”. It is widely used in East African trade and in Kenya’s mobile money economy." },
  ZAR: { name: "South African Rand", symbol: "R", desc: "It is the official currency of South Africa, symbolized as “R”. It is one of the most traded currencies on the African continent." },
  EGP: { name: "Egyptian Pound", symbol: "E£", desc: "It is the official currency of Egypt, symbolized as “E£”. It is used for trade and daily transactions across Egypt." },
  CAD: { name: "Canadian Dollar", symbol: "CA$", desc: "It is the official currency of Canada, symbolized as “CA$”. It is closely tied to commodity markets such as oil and is widely traded worldwide." },
  AUD: { name: "Australian Dollar", symbol: "A$", desc: "It is the official currency of Australia, symbolized as “A$”. It is one of the most traded currencies and is linked to the country’s mining and export economy." },
  INR: { name: "Indian Rupee", symbol: "₹", desc: "It is the official currency of India, symbolized as “₹”. It represents the strength of the Indian economy and is widely used across South Asia for trade and daily transactions." },
  CNY: { name: "Chinese Yuan", symbol: "CN¥", desc: "It is the official currency of China, symbolized as “¥”. It is increasingly used in international trade and is part of the IMF’s reserve currency basket." },
  JPY: { name: "Japanese Yen", symbol: "JP¥", desc: "It is the official currency of Japan, symbolized as “¥”. It is one of the world’s major reserve currencies and a common safe-haven choice for investors." },
  AED: { name: "United Arab Emirates Dirham", symbol: "AED", desc: "It is the official currency of the United Arab Emirates. It is used across the country’s trade, tourism and oil-related economy." },
  SAR: { name: "Saudi Riyal", symbol: "SAR", desc: "It is the official currency of Saudi Arabia. It is used across the kingdom’s economy, which is built largely on oil." },
  BRL: { name: "Brazilian Real", symbol: "R$", desc: "It is the official currency of Brazil, symbolized as “R$”. It is the main currency of South America’s largest economy." },
  MXN: { name: "Mexican Peso", symbol: "MX$", desc: "It is the official currency of Mexico, symbolized as “$” (MX$). It is one of the most traded currencies in Latin America." },
  CHF: { name: "Swiss Franc", symbol: "CHF", desc: "It is the official currency of Switzerland and Liechtenstein. It is known for its stability and is often treated as a safe-haven currency." },
  TRY: { name: "Turkish Lira", symbol: "₺", desc: "It is the official currency of Türkiye, symbolized as “₺”. It is used for trade and daily transactions across the country." },
  RUB: { name: "Russian Ruble", symbol: "₽", desc: "It is the official currency of Russia, symbolized as “₽”. It is used for trade and daily transactions across the country." }
};
