import type {
  ADUser,
  AutocompleteItem,
  RPMPackage,
  SearchResponse,
  SystemUser,
  UserProfile,
  VM,
  VMCreate,
  VMUpdate,
} from "./types";

const BASE = "/api";

let _currentUser = "a.mueller";

export function setCurrentUser(username: string) {
  _currentUser = username;
}

export function getCurrentUser() {
  return _currentUser;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-User": _currentUser,
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status}: ${body}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  listVMs(params: {
    q?: string;
    network?: string;
    status?: string;
    os?: string;
    sort_by?: string;
    order?: string;
    limit?: number;
    offset?: number;
  }) {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.network) qs.set("network", params.network);
    if (params.status) qs.set("status", params.status);
    if (params.os) qs.set("os", params.os);
    if (params.sort_by) qs.set("sort_by", params.sort_by);
    if (params.order) qs.set("order", params.order);
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.offset) qs.set("offset", String(params.offset));
    const query = qs.toString();
    return request<SearchResponse>(`/vms${query ? `?${query}` : ""}`);
  },

  autocomplete(q: string) {
    return request<AutocompleteItem[]>(`/vms/autocomplete?q=${encodeURIComponent(q)}`);
  },

  getVM(id: string) {
    return request<VM>(`/vms/${id}`);
  },

  createVM(data: VMCreate) {
    return request<VM>("/vms", { method: "POST", body: JSON.stringify(data) });
  },

  updateVM(id: string, data: VMUpdate) {
    return request<VM>(`/vms/${id}`, { method: "PUT", body: JSON.stringify(data) });
  },

  deleteVM(id: string) {
    return request<void>(`/vms/${id}`, { method: "DELETE" });
  },

  stopVM(id: string) {
    return request<VM>(`/vms/${id}/stop`, { method: "POST" });
  },

  startVM(id: string) {
    return request<VM>(`/vms/${id}/start`, { method: "POST" });
  },

  rebootVM(id: string) {
    return request<VM>(`/vms/${id}/reboot`, { method: "POST" });
  },

  listUsers() {
    return request<ADUser[]>("/users");
  },

  listPackages() {
    return request<RPMPackage[]>("/packages");
  },

  getMe() {
    return request<UserProfile>("/auth/me");
  },

  getSystemUsers() {
    return request<SystemUser[]>("/auth/users");
  },
};
