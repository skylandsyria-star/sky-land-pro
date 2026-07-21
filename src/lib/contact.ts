export function normalizePhone(input: string | null | undefined): string {
  if (!input) return "";
  const trimmed = input.trim().replace(/[\s\-()]/g, "");
  return trimmed.replace(/^00/, "+");
}

export function telHref(phone: string | null | undefined): string {
  return `tel:${normalizePhone(phone)}`;
}

export function whatsappHref(phone: string | null | undefined, message?: string): string {
  const p = normalizePhone(phone).replace(/^\+/, "");
  const q = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${p}${q}`;
}

export function formatPrice(n: number | null | undefined, currency = "SYP"): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("ar-SY").format(n) + " " + currency;
}
