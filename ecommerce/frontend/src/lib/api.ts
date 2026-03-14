const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || data.error || "Error en la petición");
  }

  return data;
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    fetchWithAuth<{ ok: boolean; data: { token: string; user: { id: number; username: string; email: string; rol: string; createdAt: string } } }>(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) }
    ),

  register: (username: string, email: string, password: string) =>
    fetchWithAuth<{ ok: boolean; data: { id: number; username: string; email: string; rol: string; createdAt: string } }>(
      "/api/auth/register",
      { method: "POST", body: JSON.stringify({ username, email, password }) }
    ),

  profile: (token: string) =>
    fetchWithAuth<{ ok: boolean; data: { id: number; username: string; email: string; rol: string; orders: unknown[]; createdAt: string } }>(
      "/api/auth/profile",
      {},
      token
    ),
};

// ── Products ──────────────────────────────────────────────────────────────────
export const productsApi = {
  getAll: () =>
    fetchWithAuth<{ ok: boolean; data: import("@/types").Product[] }>("/api/products"),

  getById: (id: number) =>
    fetchWithAuth<{ ok: boolean; data: import("@/types").Product }>(`/api/products/${id}`),

  create: (data: import("@/schemas").ProductFormData, token: string) =>
    fetchWithAuth<{ ok: boolean; data: import("@/types").Product }>(
      "/api/products",
      { method: "POST", body: JSON.stringify(data) },
      token
    ),

  update: (id: number, data: Partial<import("@/schemas").ProductFormData>, token: string) =>
    fetchWithAuth<{ ok: boolean; data: import("@/types").Product }>(
      `/api/products/${id}`,
      { method: "PUT", body: JSON.stringify(data) },
      token
    ),

  delete: (id: number, token: string) =>
    fetchWithAuth<{ ok: boolean; message: string }>(
      `/api/products/${id}`,
      { method: "DELETE" },
      token
    ),
};

// ── Categories ────────────────────────────────────────────────────────────────
export const categoriesApi = {
  getAll: () =>
    fetchWithAuth<{ ok: boolean; data: import("@/types").Category[] }>("/api/categories"),

  getById: (id: number) =>
    fetchWithAuth<{ ok: boolean; data: import("@/types").Category }>(`/api/categories/${id}`),

  create: (data: import("@/schemas").CategoryFormData, token: string) =>
    fetchWithAuth<{ ok: boolean; data: import("@/types").Category }>(
      "/api/categories",
      { method: "POST", body: JSON.stringify(data) },
      token
    ),

  update: (id: number, data: Partial<import("@/schemas").CategoryFormData>, token: string) =>
    fetchWithAuth<{ ok: boolean; data: import("@/types").Category }>(
      `/api/categories/${id}`,
      { method: "PUT", body: JSON.stringify(data) },
      token
    ),

  delete: (id: number, token: string) =>
    fetchWithAuth<{ ok: boolean; message: string }>(
      `/api/categories/${id}`,
      { method: "DELETE" },
      token
    ),
};

// ── Orders ────────────────────────────────────────────────────────────────────
export const ordersApi = {
  getAll: (token: string) =>
    fetchWithAuth<{ ok: boolean; data: import("@/types").Order[] }>("/api/orders", {}, token),

  getArchived: (token: string) =>
    fetchWithAuth<{ ok: boolean; data: import("@/types").Order[] }>("/api/orders/archived", {}, token),

  getById: (id: number, token: string) =>
    fetchWithAuth<{ ok: boolean; data: import("@/types").Order }>(`/api/orders/${id}`, {}, token),

  create: (items: { productId: number; quantity: number }[], token: string) =>
    fetchWithAuth<{ ok: boolean; data: import("@/types").Order }>(
      "/api/orders",
      { method: "POST", body: JSON.stringify({ items }) },
      token
    ),

  updateStatus: (id: number, status: import("@/types").OrderStatus, token: string) =>
    fetchWithAuth<{ ok: boolean; data: import("@/types").Order }>(
      `/api/orders/${id}/status`,
      { method: "PATCH", body: JSON.stringify({ status }) },
      token
    ),

  archive: (id: number, token: string) =>
    fetchWithAuth<{ ok: boolean; data: import("@/types").Order }>(
      `/api/orders/${id}`,
      { method: "DELETE" },
      token
    ),

  cancel: (id: number, token: string) =>
    fetchWithAuth<{ ok: boolean; data: import("@/types").Order }>(
      `/api/orders/${id}/cancel`,
      { method: "PATCH" },
      token
    ),
};
