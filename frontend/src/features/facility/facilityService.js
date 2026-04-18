import { apiRequest } from "../../lib/apiClient.js";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";
const BASE_PATH = "/api/facilities";

async function request(path, { method = "GET", token, body } = {}) {
  if (!token) {
    const err = new Error("Missing auth token");
    err.status = 401;
    throw err;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const contentType = res.headers.get("content-type") || "";
  const payload = await (contentType.includes("application/json") ? res.json() : res.text()).catch(() => null);

  if (!res.ok) {
    const err = new Error(
      typeof payload === "string" && payload
        ? payload
        : (payload && payload.message) || `Request failed with status ${res.status}`
    );
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  return payload;
}

export function getAllFacilities(token) {
  return apiRequest(`${BASE_PATH}`, { method: "GET", token });
}

export function getFacilityById(token, id) {
  return apiRequest(`${BASE_PATH}/${encodeURIComponent(id)}`, { method: "GET", token });
}

export function createFacility(token, data) {
  return request(`${BASE_PATH}`, { method: "POST", token, body: data });
}

export function updateFacility(token, id, data) {
  return request(`${BASE_PATH}/${encodeURIComponent(id)}`, { method: "PUT", token, body: data });
}

export function deleteFacility(token, id) {
  return request(`${BASE_PATH}/${encodeURIComponent(id)}`, { method: "DELETE", token });
}