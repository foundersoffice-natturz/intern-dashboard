export function parseAllowlist(): Set<string> {
  const raw = process.env.MANAGEMENT_EMAILS || "";
  return new Set(
    raw.split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
  );
}

export function isAllowedEmail(email?: string | null): boolean {
  if (!email) return false;

  const allow = parseAllowlist();
  if (allow.size && allow.has(email.toLowerCase())) return true;

  const domain = (process.env.ALLOWED_DOMAIN || "").toLowerCase().trim();
  if (domain && email.toLowerCase().endsWith("@" + domain)) return true;

  return false;
}
