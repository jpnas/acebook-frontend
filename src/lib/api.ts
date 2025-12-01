import {
  type ApiRequestOptions,
  type ApiResponse,
  type ClubSlugAvailability,
  type Coach,
  type Court,
  type ForgotPasswordResult,
  type RegisterPayload,
  type ResetPasswordPayload,
  type Reservation,
  type User,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

async function request<T>(
  endpoint: string,
  { auth, headers, body, method = "GET", ...rest }: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  if (USE_MOCK) {
    return {
      data: [] as T,
      message: "Modo mock ativo. Configure NEXT_PUBLIC_API_BASE_URL para usar o backend.",
    };
  }

  const authHeaders = auth
    ? {
        Authorization: typeof window === "undefined"
          ? "Bearer <token>"
          : `Bearer ${localStorage.getItem("acebook.accessToken") ?? ""}`,
      }
    : undefined;

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...headers,
    },
    body,
    ...rest,
  });

  if (!response.ok) {
    const rawError = await response.text();
    let message = rawError;
    try {
      const parsed = JSON.parse(rawError);
      if (typeof parsed === "string") {
        message = parsed;
      } else if (Array.isArray(parsed)) {
        message = parsed.join(" ");
      } else if (parsed?.detail) {
        message = parsed.detail;
      } else if (typeof parsed === "object") {
        message = Object.values(parsed)
          .flat()
          .map(String)
          .join(" ");
      }
    } catch {
      // ignore JSON parse failure
    }
    const error = new Error(message || `Falha ao chamar ${endpoint}`);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return { data: undefined as T };
  }

  const data = (await response.json()) as T;
  return { data };
}

export const api = {
  auth: {
    login: (payload: { email: string; password: string }) =>
      request<{
        access: string;
        refresh: string;
        user: User;
      }>("/auth/login/", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    me: () =>
      request<User>("/me/", {
        auth: true,
      }),
    register: (payload: RegisterPayload) =>
      request<User>("/auth/register/", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    forgotPassword: (payload: { email: string }) =>
      request<ForgotPasswordResult>("/auth/password/forgot/", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    resetPassword: (payload: ResetPasswordPayload) =>
      request<{ detail: string }>("/auth/password/reset/", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },
  courts: {
    list: (query = "") =>
      request<Court[]>(`/courts/${query}`, {
        auth: true,
      }),
    create: (payload: Omit<Court, "id">) =>
      request<Court>("/courts/", {
        method: "POST",
        body: JSON.stringify(payload),
        auth: true,
      }),
    update: (id: number, payload: Partial<Omit<Court, "id">>) =>
      request<Court>(`/courts/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
        auth: true,
      }),
    remove: (id: number) =>
      request<void>(`/courts/${id}/`, {
        method: "DELETE",
        auth: true,
      }),
  },
  coaches: {
    list: () =>
      request<Coach[]>("/coaches/", {
        auth: true,
      }),
    create: (payload: Omit<Coach, "id">) =>
      request<Coach>("/coaches/", {
        method: "POST",
        body: JSON.stringify(payload),
        auth: true,
      }),
    update: (id: number, payload: Partial<Omit<Coach, "id">>) =>
      request<Coach>(`/coaches/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
        auth: true,
      }),
    remove: (id: number) =>
      request<void>(`/coaches/${id}/`, {
        method: "DELETE",
        auth: true,
      }),
  },
  reservations: {
    list: (query = "") =>
      request<Reservation[]>(`/reservations/${query}`, {
        auth: true,
      }),
    create: (payload: Partial<Omit<Reservation, "id" | "court_name" | "player_name" | "status">>) =>
      request<Reservation>("/reservations/", {
        method: "POST",
        body: JSON.stringify(payload),
        auth: true,
      }),
    update: (id: number, payload: Partial<Omit<Reservation, "id" | "court_name" | "player_name">>) =>
      request<Reservation>(`/reservations/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
        auth: true,
      }),
    remove: (id: number) =>
      request<void>(`/reservations/${id}/`, {
        method: "DELETE",
        auth: true,
      }),
    availability: (court: number, date: string) =>
      request<{ occupied: string[] }>(`/reservations/availability/?court=${court}&date=${date}`, {
        auth: true,
      }),
  },
  users: {
    list: (query = "") =>
      request<User[]>(`/club-users/${query}`, {
        auth: true,
      }),
    update: (id: number, payload: Partial<Pick<User, "email">> & { first_name?: string; last_name?: string }) =>
      request<User>(`/club-users/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
        auth: true,
      }),
    remove: (id: number) =>
      request<void>(`/club-users/${id}/`, {
        method: "DELETE",
        auth: true,
      }),
  },
  clubs: {
    checkSlug: (slug: string) =>
      request<ClubSlugAvailability>(`/clubs/check-slug/?slug=${encodeURIComponent(slug.trim())}`),
  },
};

export type ApiClient = typeof api;
