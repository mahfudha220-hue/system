const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export const apiUrl = (path) => `${API_BASE}${path}`;

export async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = localStorage.getItem("access");
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(apiUrl(path), { ...options, headers });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    if (res.status === 401) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    throw new Error(payload.detail || "Request failed");
  }
  if (res.status === 204) return null;
  return res.json();
}
