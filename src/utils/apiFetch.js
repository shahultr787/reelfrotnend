/**
 * utils/apiFetch.js
 */

const API_LIST = (process.env.REACT_APP_API_BASE || "http://localhost:5000")
  .split(",")
  .map((u) => u.trim())
  .filter(Boolean);

let isRefreshing = false;
let refreshPromise = null;

/* ── Header Builder ───────────────────────── */
const buildHeaders = (options = {}) => {
  if (options.body instanceof FormData) {
    return {
      "ngrok-skip-browser-warning": "true",
      ...(options.headers || {}),
    };
  }
  return {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    ...(options.headers || {}),
  };
};

/* ── API Request With Fallback ────────────── */
const requestWithFallback = async (url, options = {}) => {
  let lastError;

  for (const base of API_LIST) {
    try {
      const response = await fetch(`${base}${url}`, {
        ...options,
        credentials: "include",
        headers: buildHeaders(options),
      });

      return { response, base };
    } catch (err) {
      console.warn(`API failed at ${base}: ${err.message}`);
      lastError = err;
    }
  }

  throw lastError || new Error("All API endpoints failed.");
};

/* ── Main Fetch Wrapper ───────────────────── */
export const apiFetch = async (url, options = {}) => {
  const makeRequest = () => requestWithFallback(url, options);

  let { response, base } = await makeRequest();

  /* ── 403 PROFILE_INCOMPLETE ─────────────── */
  if (response.status === 403) {
    try {
      const data = await response.clone().json();
      if (data?.code === "PROFILE_INCOMPLETE") {
        window.location.href = data.redirect || "/complete-profile";
        throw new Error("Profile completion required.");
      }
    } catch (e) {
      if (e.message === "Profile completion required.") throw e;
    }
    return handleResponse(response);
  }

  /* ── Not a 401 ──────────────────────────── */
  if (response.status !== 401) {
    return handleResponse(response);
  }

  /* ── 401 → Refresh Token (deduplicated) ─── */
  if (!isRefreshing) {
    isRefreshing = true;
    refreshPromise = fetch(`${base}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "ngrok-skip-browser-warning": "true" },
    }).finally(() => {
      isRefreshing = false;
    });
  }

  const refreshResponse = await refreshPromise;
  refreshPromise = null;

  if (!refreshResponse?.ok) {
    window.location.href = "/auth/sign-in";
    throw new Error("Session expired. Please sign in again.");
  }

  /* ── Retry Original Request ─────────────── */
  ({ response } = await makeRequest());
  return handleResponse(response);
};

/* ── Response Normaliser ─────────────────── */
const handleResponse = async (response) => {
  if (!response.ok) {
    let message = "Request failed";
    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      message = (await response.text()) || message;
    }
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }

  const contentType = response.headers.get("content-type") || "";
  return contentType.includes("application/json")
    ? response.json()
    : response.text();
};