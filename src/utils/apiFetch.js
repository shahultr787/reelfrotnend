import config from "../config";

let isRefreshing = false;
let refreshPromise = null;

export const apiFetch = async (url, options = {}) => {
  const makeRequest = () =>
    fetch(`${config.API_BASE}${url}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options
    });

  let response = await makeRequest();

  // ✅ If NOT unauthorized → return normally
  if (response.status !== 401) {
    return handleResponse(response);
  }

  // 🔥 Access token expired → try refresh

  if (!isRefreshing) {
    isRefreshing = true;

    refreshPromise = fetch(`${config.API_BASE}/api/auth/refresh`, {
      method: "POST",
      credentials: "include"
    }).finally(() => {
      isRefreshing = false;
    });
  }

  const refreshResponse = await refreshPromise;

  if (!refreshResponse.ok) {
    // 🔴 Refresh failed → session expired
    window.location.href = "/auth/sign-in";
    throw new Error("Session expired");
  }

  // 🔁 Retry original request after refresh
  response = await makeRequest();

  return handleResponse(response);
};

// 🔥 Clean response handler
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Request failed");
  }

  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
};