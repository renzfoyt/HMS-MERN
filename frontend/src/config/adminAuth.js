import { API_BASE_URL } from "./api";

const TOKEN_KEY = "adminToken";

export const getAdminToken = () => localStorage.getItem(TOKEN_KEY);
export const setAdminToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearAdminToken = () => localStorage.removeItem(TOKEN_KEY);

/**
 * Fetch wrapper that attaches the admin JWT and auto-clears it on 401.
 * Throws on non-2xx responses so callers can catch and show errors.
 */
export async function adminFetch(path, options = {}) {
  const token = getAdminToken();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 401) {
    clearAdminToken();
    throw new Error("SESSION_EXPIRED");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
}