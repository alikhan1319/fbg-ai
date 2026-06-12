const NEWSLETTER_STORAGE_KEY = "fbg_newsletter_subscribed";

export function getSubscribedEmails(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(NEWSLETTER_STORAGE_KEY);
    if (!raw) return new Set();
    const list = JSON.parse(raw);
    return new Set(Array.isArray(list) ? list.map(String) : []);
  } catch {
    return new Set();
  }
}

export function rememberSubscribedEmail(email: string) {
  if (typeof window === "undefined") return;
  const normalized = email.trim().toLowerCase();
  if (!normalized) return;
  const set = getSubscribedEmails();
  set.add(normalized);
  localStorage.setItem(NEWSLETTER_STORAGE_KEY, JSON.stringify([...set]));
}

export function isEmailSubscribedLocally(email: string): boolean {
  return getSubscribedEmails().has(email.trim().toLowerCase());
}
