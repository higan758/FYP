
import { tokenStorage } from "../auth/tokenStorage";

const baseUrl =
  process.env.REACT_APP_API_BASE_URL?.trim() || "http://localhost:5143";


async function request(path, { method = "GET", body, headers } = {}) {
  const token = tokenStorage.get();

  const fetchOptions = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  };

  console.log(`[http] ${method} ${path}`, { hasToken: !!token, body });

  const res = await fetch(`${baseUrl}${path}`, fetchOptions);

  // Try to parse JSON (even for errors)
  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }

  if (!res.ok) {
    // Extract error message from response
    const message =
      (data && (data.error || data.message || data.title)) ||
      `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    console.error(`[http] Request failed: ${res.status} - ${message}`, data);
    
    if (res.status === 401) {
      try {
        tokenStorage.clear();
      } catch {}
      if (typeof window !== "undefined" && window.location && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    throw err;
  }

  return data;
}

async function uploadFile(path, formData) {
  const token = tokenStorage.get();

  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }

  if (!res.ok) {
    const message =
      (data && (data.error || data.message || data.title)) ||
      `Upload failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const http = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  delete: (path) => request(path, { method: "DELETE" }),
  upload: (path, formData) => uploadFile(path, formData),
};
