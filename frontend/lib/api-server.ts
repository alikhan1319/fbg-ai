/** Base URL for server-side fetches to the FastAPI backend. */
export function getServerApiUrl(): string {
  const url =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000";
  return url.replace(/\/$/, "");
}

export const CMS_FETCH_OPTIONS: RequestInit = { cache: "no-store" };
