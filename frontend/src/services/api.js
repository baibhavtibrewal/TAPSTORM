const BASE = import.meta.env.VITE_API_URL || "/api";

function getToken() {
  return localStorage.getItem("ts_token");
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw Object.assign(new Error(data.error || "Request failed"), { status: res.status, data });
  }

  return data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const auth = {
  register: (username, password) =>
    request("/auth/register", { method: "POST", body: JSON.stringify({ username, password }) }),

  login: (username, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),

  me: () => request("/auth/me"),
};

// ─── Scores ───────────────────────────────────────────────────────────────────

export const scores = {
  submit: ({ score, mode, startedAt, elapsedMs }) =>
    request("/scores/submit", {
      method: "POST",
      body: JSON.stringify({ score, mode, startedAt, elapsedMs }),
    }),

  leaderboard: (mode, period) =>
    request(`/scores/leaderboard?mode=${mode}&period=${period}`),

  stats: (mode) =>
    request(`/scores/stats${mode ? `?mode=${mode}` : ""}`),

  history: (mode, limit = 20) =>
    request(`/scores/history?limit=${limit}${mode ? `&mode=${mode}` : ""}`),
};
