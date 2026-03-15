/**
 * utils/apiFetch.js
 *
 * Drop-in fetch wrapper that:
 *  • Automatically retries once after a 401 by calling /api/auth/refresh
 *  • Deduplicates concurrent refresh calls (only one refresh at a time)
 *  • Redirects to /auth/sign-in if refresh fails
 *  • Redirects to /complete-profile on 403 PROFILE_INCOMPLETE (globally)
 *
 * WHY handle PROFILE_INCOMPLETE here?
 *  The backend already BLOCKS the request with a 403 — a hacker gets
 *  nothing. This redirect is purely UX for legitimate users so every
 *  page/component doesn't have to repeat the same check individually.
 */

const API_BASE = process.env.REACT_APP_API_BASE || "";

let isRefreshing   = false;
let refreshPromise = null;

const buildHeaders = (options = {}) => {
  // Don't set Content-Type for FormData — browser sets multipart boundary
  if (options.body instanceof FormData) {
    return { ...(options.headers || {}) };
  }
  return {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
};

export const apiFetch = async (url, options = {}) => {
  const makeRequest = () =>
    fetch(`${API_BASE}${url}`, {
      ...options,
      credentials: "include",
      headers: buildHeaders(options),
    });

  let response = await makeRequest();

  /* ── 403 → check if it's a profile-incomplete block ───── */
  if (response.status === 403) {
    // Clone before reading — body can only be consumed once
    const cloned = response.clone();
    try {
      const data = await cloned.json();
      if (data?.code === "PROFILE_INCOMPLETE") {
        // Backend tells us exactly where to go
        window.location.href = data.redirect || "/complete-profile";
        // Throw so the calling code doesn't try to process a null response
        throw new Error("Profile completion required.");
      }
    } catch (e) {
      // If it wasn't PROFILE_INCOMPLETE, fall through to handleResponse
      // which will throw a proper error with the message
      if (e.message === "Profile completion required.") throw e;
    }
    return handleResponse(response);
  }

  /* ── Not a 401 → return normally ───────────────────────── */
  if (response.status !== 401) {
    return handleResponse(response);
  }

  /* ── 401 → try to refresh (deduplicated) ────────────────── */
  if (!isRefreshing) {
    isRefreshing   = true;
    refreshPromise = fetch(`${API_BASE}/api/auth/refresh`, {
      method:      "POST",
      credentials: "include",
    }).finally(() => {
      isRefreshing   = false;
      refreshPromise = null;
    });
  }

  const refreshResponse = await refreshPromise;

  if (!refreshResponse || !refreshResponse.ok) {
    // Refresh failed — session is dead
    window.location.href = "/auth/sign-in";
    throw new Error("Session expired. Please sign in again.");
  }

  // Retry the original request with the new access token cookie
  response = await makeRequest();
  return handleResponse(response);
};

/* ── Response normaliser ─────────────────────────────────── */
const handleResponse = async (response) => {
  if (!response.ok) {
    let message = "Request failed";
    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      message = (await response.text()) || message;
    }
    const err    = new Error(message);
    err.status   = response.status;
    throw err;
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
};