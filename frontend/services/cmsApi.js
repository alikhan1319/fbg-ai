/**
 * CMS API — blog, newsletter, analytics (public + admin).
 */

const SERVER_API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

const ADMIN_FETCH = { credentials: "include" };

function apiUrl(path) {
  if (typeof window !== "undefined") {
    return path;
  }
  return `${SERVER_API_URL}${path}`;
}

async function parseError(response, fallback) {
  let message = fallback;
  try {
    const data = await response.json();
    if (typeof data.detail === "string") {
      message = data.detail;
    } else if (Array.isArray(data.detail)) {
      const parts = data.detail
        .map((entry) => (typeof entry === "string" ? entry : entry?.msg))
        .filter(Boolean);
      if (parts.length) message = parts.join(", ");
    } else if (data.detail && typeof data.detail === "object" && typeof data.detail.message === "string") {
      message = data.detail.message;
    }
  } catch {
    // keep fallback
  }
  throw new Error(message);
}

async function readJsonResponse(response) {
  const text = await response.text();
  if (!text) return null;
  return JSON.parse(text);
}

async function fetchJson(path, options = {}) {
  const response = await fetch(apiUrl(path), {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!response.ok) {
    await parseError(response, `Request failed (${response.status})`);
  }
  return response.json();
}

async function fetchAdminJson(path, options = {}) {
  const { headers: optionHeaders, ...restOptions } = options;
  const response = await fetch(apiUrl(path), {
    ...ADMIN_FETCH,
    cache: "no-store",
    ...restOptions,
    headers: { "Content-Type": "application/json", ...(optionHeaders || {}) },
  });
  if (!response.ok) {
    await parseError(response, `Request failed (${response.status})`);
  }
  return readJsonResponse(response);
}

// ---------------------------------------------------------------------------
// Public blog
// ---------------------------------------------------------------------------

const PUBLIC_FETCH = { cache: "no-store" };

export async function fetchBlogPosts(page = 1, limit = 12) {
  return fetchJson(`/api/blog?page=${page}&limit=${limit}&_=${Date.now()}`, PUBLIC_FETCH);
}

export async function fetchBlogSlugs() {
  const data = await fetchJson(`/api/blog/slugs?_${Date.now()}`, PUBLIC_FETCH);
  return data.slugs || [];
}

export async function fetchBlogArticle(slug) {
  return fetchJson(`/api/blog/${encodeURIComponent(slug)}?_${Date.now()}`, PUBLIC_FETCH);
}

export async function fetchRelatedBlogPosts(slug, limit = 3) {
  return fetchJson(
    `/api/blog/${encodeURIComponent(slug)}/related?limit=${limit}&_=${Date.now()}`,
    PUBLIC_FETCH
  );
}

// ---------------------------------------------------------------------------
// Newsletter
// ---------------------------------------------------------------------------

export async function subscribeNewsletter(email, source = "Footer") {
  const response = await fetch(apiUrl("/api/newsletter/subscribe"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase(), source }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof data.detail === "string"
        ? data.detail
        : "Could not subscribe. Please try again.";
    throw new Error(message);
  }

  return data;
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export async function trackPageView(path = "/") {
  try {
    await fetchJson("/api/analytics/page-view", {
      method: "POST",
      body: JSON.stringify({ path }),
    });
  } catch {
    // non-blocking
  }
}

export async function trackToolUsage(toolId, toolName) {
  try {
    await fetchJson("/api/analytics/tool-usage", {
      method: "POST",
      body: JSON.stringify({ tool_id: toolId, tool_name: toolName }),
    });
  } catch {
    // non-blocking
  }
}

// ---------------------------------------------------------------------------
// Admin auth
// ---------------------------------------------------------------------------

export async function fetchAdminBootstrapStatus() {
  return fetchJson("/api/admin/auth/bootstrap");
}

export async function adminLogin(email, password) {
  return fetchAdminJson("/api/admin/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });
}

export async function adminLogout() {
  return fetchAdminJson("/api/admin/auth/logout", { method: "POST" });
}

export async function fetchAdminMe() {
  return fetchAdminJson("/api/admin/auth/me");
}

// ---------------------------------------------------------------------------
// Admin users
// ---------------------------------------------------------------------------

export async function fetchAdminUsers() {
  return fetchAdminJson("/api/admin/users");
}

export async function createAdminUser(payload) {
  return fetchAdminJson("/api/admin/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminUser(id) {
  return fetchAdminJson(`/api/admin/users/${id}`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export async function fetchAdminDashboard() {
  return fetchAdminJson("/api/admin/dashboard");
}

export async function fetchAdminBlogCategories() {
  const data = await fetchAdminJson("/api/admin/blog/categories/list");
  return data.categories || [];
}

export async function uploadBlogImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(apiUrl("/api/admin/media/upload"), {
    method: "POST",
    body: formData,
    ...ADMIN_FETCH,
  });
  if (!response.ok) {
    await parseError(response, "Image upload failed.");
  }
  return response.json();
}

export async function fetchAdminBlogPosts() {
  return fetchAdminJson(`/api/admin/blog?_=${Date.now()}`);
}

export async function fetchAdminBlogPost(id) {
  return fetchAdminJson(`/api/admin/blog/${id}`);
}

export async function createAdminBlogPost(payload) {
  return fetchAdminJson("/api/admin/blog", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminBlogPost(id, payload) {
  return fetchAdminJson(`/api/admin/blog/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminBlogPost(id) {
  const data = await fetchAdminJson(`/api/admin/blog/${id}`, { method: "DELETE" });
  if (!data || data.status !== "deleted") {
    throw new Error("Delete failed. The post was not removed from the database.");
  }
  return data;
}

export async function fetchAdminNewsletter() {
  return fetchAdminJson("/api/admin/newsletter");
}

export async function deleteAdminNewsletterSubscriber(id) {
  return fetchAdminJson(`/api/admin/newsletter/${id}`, { method: "DELETE" });
}

export async function exportAdminNewsletter() {
  const response = await fetch(apiUrl("/api/admin/newsletter/export"), ADMIN_FETCH);
  if (!response.ok) {
    await parseError(response, "Export failed.");
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "newsletter-subscribers.csv";
  link.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Admin site content
// ---------------------------------------------------------------------------

export async function fetchAdminSiteFaq() {
  return fetchAdminJson("/api/admin/site/faq");
}

export async function createAdminSiteFaq(payload) {
  return fetchAdminJson("/api/admin/site/faq", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminSiteFaq(id, payload) {
  return fetchAdminJson(`/api/admin/site/faq/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminSiteFaq(id) {
  return fetchAdminJson(`/api/admin/site/faq/${id}`, { method: "DELETE" });
}

export async function fetchAdminSiteTestimonials() {
  return fetchAdminJson("/api/admin/site/testimonials");
}

export async function createAdminSiteTestimonial(payload) {
  return fetchAdminJson("/api/admin/site/testimonials", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminSiteTestimonial(id, payload) {
  return fetchAdminJson(`/api/admin/site/testimonials/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminSiteTestimonial(id) {
  return fetchAdminJson(`/api/admin/site/testimonials/${id}`, { method: "DELETE" });
}

export async function fetchAdminSiteLegal(slug) {
  return fetchAdminJson(`/api/admin/site/legal/${slug}`);
}

export async function updateAdminSiteLegal(slug, payload) {
  return fetchAdminJson(`/api/admin/site/legal/${slug}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export { SERVER_API_URL as API_URL };
