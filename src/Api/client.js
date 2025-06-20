const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_KEY = process.env.REACT_APP_API_KEY;

async function request(path, options = {}) {
  const res = await fetch(BASE_URL + path, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    const error = new Error(errorBody?.message || res.statusText);
    error.status = res.status;
    throw error;
  }

  return res.json();
}

export default {
  get: (path, opts) => request(path, { method: "GET", ...opts }),
  post: (path, body, opts) =>
    request(path, { method: "POST", body: JSON.stringify(body), ...opts }),
  put: (path, body, opts) =>
    request(path, { method: "PUT", body: JSON.stringify(body), ...opts }),
  delete: (path, opts) => request(path, { method: "DELETE", ...opts }),
};
