/**
 * utils/apiFetch.js
 *
 * Matches the backend TOKEN_MODE automatically via REACT_APP_TOKEN_MODE.
 *
 * In your frontend .env:
 *   REACT_APP_TOKEN_MODE=DEV   → Bearer header mode (cross-origin safe)
 *   REACT_APP_TOKEN_MODE=PROD  → Cookie mode (production)
 *
 * Keep REACT_APP_TOKEN_MODE in sync with your backend TOKEN_MODE.
 * That's the only thing you ever need to change.
 */

const API_LIST = (process.env.REACT_APP_API_BASE || "http://localhost:5000")
  .split(",").map(u => u.trim()).filter(Boolean);

const IS_DEV = (process.env.REACT_APP_TOKEN_MODE || "PROD").toUpperCase() === "DEV";

/* ── In-memory token store (DEV / bearer mode only) ─────────
 *
 *  Tokens live in a plain JS variable — never localStorage.
 *  They're lost on page refresh, which triggers a silent
 *  /api/auth/refresh call automatically.
 * ────────────────────────────────────────────────────────── */
let _accessToken  = null;
let _refreshToken = null;

export const saveTokens  = (at, rt) => { _accessToken = at; if (rt) _refreshToken = rt; };
export const forgetTokens = ()       => { _accessToken = null; _refreshToken = null; };

/* ── Refresh dedup ───────────────────────────────────────── */
let _refreshing = false;
let _refreshP   = null;

/* ── Helpers ─────────────────────────────────────────────── */
const isNgrok = (url) => url.includes("ngrok-free.app") || url.includes("ngrok.io");

const buildHeaders = (options = {}, base = "") => {
  const h = { ...(options.headers || {}) };

  if (!(options.body instanceof FormData)) h["Content-Type"] = "application/json";
  if (isNgrok(base))    h["ngrok-skip-browser-warning"] = "true";
  if (IS_DEV && _accessToken) h["Authorization"] = `Bearer ${_accessToken}`;

  return h;
};

const tryFetch = async (url, options = {}) => {
  let lastErr;
  for (const base of API_LIST) {
    try {
      const res = await fetch(`${base}${url}`, {
        ...options,
        credentials: "include",
        headers: buildHeaders(options, base),
      });

      // Guard against ngrok HTML warning page
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("text/html")) {
        const t = await res.text();
        if (t.toLowerCase().includes("ngrok"))
          throw new Error(`ngrok warning page at ${base} — check headers`);
      }

      return { res, base };
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error("All API endpoints failed");
};

const parseResponse = async (res) => {
  if (!res.ok) {
    const ct  = res.headers.get("content-type") || "";
    const msg = ct.includes("application/json")
      ? (await res.json()).message || "Request failed"
      : await res.text();
    const err  = new Error(msg);
    err.status = res.status;
    throw err;
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
};

const doRefresh = async (base) => {
  const body    = IS_DEV && _refreshToken ? JSON.stringify({ refreshToken: _refreshToken }) : undefined;
  const headers = buildHeaders({}, base);

  const resp = await fetch(`${base}/api/auth/refresh`, {
    method: "POST", credentials: "include", headers, body,
  });

  if (!resp.ok) return null;

  const data = await resp.json();
  if (IS_DEV && data.accessToken) saveTokens(data.accessToken, data.refreshToken);
  return data;
};

/* ── Main export ─────────────────────────────────────────── */
export const apiFetch = async (url, options = {}) => {
  let { res, base } = await tryFetch(url, options);

  // 403 PROFILE_INCOMPLETE
  if (res.status === 403) {
    try {
      const d = await res.clone().json();
      if (d?.code === "PROFILE_INCOMPLETE") {
        window.location.href = d.redirect || "/complete-profile";
        throw new Error("Profile completion required.");
      }
    } catch (e) { if (e.message === "Profile completion required.") throw e; }
    return parseResponse(res);
  }

  if (res.status !== 401) return parseResponse(res);

  // 401 → refresh (deduplicated)
  if (!_refreshing) {
    _refreshing = true;
    _refreshP   = doRefresh(base).finally(() => { _refreshing = false; });
  }

  const refreshed = await _refreshP;
  _refreshP = null;

  if (!refreshed) {
    forgetTokens();
    window.location.href = "/auth/sign-in";
    throw new Error("Session expired. Please sign in again.");
  }

  ({ res } = await tryFetch(url, options));
  return parseResponse(res);
};

export default apiFetch;
