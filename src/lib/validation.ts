const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Common misspellings of popular email domains
const TYPO_DOMAINS: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.co": "gmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yahoo.con": "yahoo.com",
  "hotmial.com": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "outlok.com": "outlook.com",
  "outlook.con": "outlook.com"
};

export function validateEmail(value: string): string | null {
  const email = value.trim();
  if (!EMAIL_RE.test(email)) return "Please enter a valid email address.";
  const domain = email.split("@")[1].toLowerCase();
  if (TYPO_DOMAINS[domain]) return "Looks like a typo — check your email domain.";
  return null;
}

export function validatePassword(value: string, opts: { requireStrong?: boolean } = {}): string | null {
  if (/\s/.test(value)) return "Remove extra spaces in your password.";
  if (!value) return "Enter your password.";
  if (opts.requireStrong && value.length < 8) return "Use at least 8 characters.";
  return null;
}

export function validateName(value: string): string | null {
  if (value.trim().length < 2) return "Enter your name.";
  return null;
}
