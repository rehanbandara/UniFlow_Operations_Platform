const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

async function parseBody(res) {
  if (res.status === 204) return null;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }
  try {
    return await res.text();
  } catch {
    return null;
  }
}

function normalizeError(res, payload) {
  const message =
    (payload && typeof payload === "object" && payload.message) ||
    (typeof payload === "string" && payload) ||
    `Request failed with status ${res.status}`;

  const err = new Error(message);
  err.status = res.status;
  err.payload = payload;
  return err;
}

/**
 * apiRequest(path, { method, token, body, headers })
 * - path must start with "/"
 * - throws Error with .status and .payload on non-2xx
 */
export async function apiRequest(path, { method = "GET", token, body, headers } = {}) {
  const finalHeaders = {
    ...(body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(headers || {}),
  };

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await parseBody(res);

  if (!res.ok) throw normalizeError(res, payload);

  return payload;
}