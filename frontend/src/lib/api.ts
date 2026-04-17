// 🔥 FINAL BACKEND URL
const API_BASE = "https://flashcard-engine-qflr.onrender.com";

console.log("API BASE 👉", API_BASE);

// ================= TOKEN =================
function getToken(): string | null {
  return localStorage.getItem("fc_token");
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ================= CORE FETCH =================
async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    localStorage.removeItem("fc_token");
    localStorage.removeItem("fc_user");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(body.detail || `Error ${res.status}`);
  }

  return res.json();
}

// ================= AUTH =================
export async function apiRegister(email: string, password: string) {
  return apiFetch<{ user_id: string; email: string; token: string }>("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export async function apiLogin(email: string, password: string) {
  return apiFetch<{ user_id: string; email: string; token: string }>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export async function apiGetMe() {
  return apiFetch<{ user_id: string; email: string }>("/auth/me");
}

// ================= DECKS =================
export async function apiGetDecks() {
  return apiFetch<any[]>("/decks");
}

export async function apiCreateDeck(name: string, description: string) {
  return apiFetch<any>("/decks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description }),
  });
}

export async function apiGetDeck(deckId: string) {
  return apiFetch<any>(`/decks/${deckId}`);
}

export async function apiDeleteDeck(deckId: string) {
  return apiFetch<any>(`/decks/${deckId}`, { method: "DELETE" });
}

// ================= PDF UPLOAD =================
export async function apiUploadPdf(deckId: string, file: File, subject: string = "general") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("subject", subject);

  const res = await fetch(`${API_BASE}/decks/${deckId}/upload-pdf`, {
    method: "POST",
    headers: {
      ...authHeaders(),
    },
    body: formData,
  });

  if (res.status === 401) {
    localStorage.removeItem("fc_token");
    localStorage.removeItem("fc_user");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(body.detail || `Error ${res.status}`);
  }

  return res.json();
}

// ================= GENERATE =================
export async function apiGenerateFromTopic(deckId: string) {
  return apiFetch<{ deck_id: string; cards_generated: number }>(
    `/decks/${deckId}/generate`,
    { method: "POST" }
  );
}

// ================= CARDS =================
export async function apiGetCards(deckId: string, dueOnly = false) {
  const query = dueOnly ? "?due_only=true" : "";
  return apiFetch<any[]>(`/cards/deck/${deckId}${query}`);
}

export async function apiRateCard(cardId: string, qualityRating: number, timeSpentSeconds?: number) {
  return apiFetch<any>(`/cards/${cardId}/rate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      quality_rating: qualityRating,
      time_spent_seconds: timeSpentSeconds,
    }),
  });
}

// ================= STATS =================
export async function apiGetDeckStats(deckId: string) {
  return apiFetch<any>(`/stats/deck/${deckId}`);
}

export async function apiGetOverallStats() {
  return apiFetch<any>("/stats/overall");
}
