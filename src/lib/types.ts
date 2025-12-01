export type UserRole = "player" | "admin";

export interface Club {
  id: number;
  name: string;
  slug: string;
}

export interface ClubSlugAvailability {
  slug: string;
  valid: boolean;
  available: boolean;
}

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  club: Club | null;
}

export interface Coach {
  id: number;
  name: string;
  phone: string;
}

export interface Court {
  id: number;
  name: string;
  surface: "saibro" | "rápida";
  covered: boolean;
  lights: boolean;
  status: "disponível" | "manutenção";
  opens_at: string;
  closes_at: string;
}

export interface Reservation {
  id: number;
  court: number;
  court_name: string;
  player: number;
  player_name: string;
  start_time: string;
  end_time: string;
  status: "confirmada" | "pendente" | "cancelada";
  type: "treino" | "recreativo" | "torneio" | "performance";
}

export interface AcademyUser {
  id: number;
  name: string;
  role: UserRole;
  rating: number;
  email: string;
  phone: string;
  plan: "mensal" | "avulso" | "premium";
  availability: string[];
}

export interface AvailabilitySlot {
  day: string;
  start: string;
  end: string;
  audience: "adulto" | "infantil" | "performance";
}

export interface DashboardStat {
  label: string;
  value: string;
  helper: string;
  trend: number;
}

export interface ActivityLog {
  time: string;
  message: string;
  icon: string;
  variant: "default" | "success" | "warning";
}

export interface ApiRequestOptions extends RequestInit {
  auth?: boolean;
  tags?: string[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  role?: UserRole;
  name?: string;
  club_slug?: string;
  club_name?: string;
}

export interface ForgotPasswordResult {
  detail: string;
  uid?: string;
  token?: string;
}

export interface ResetPasswordPayload {
  uid: string;
  token: string;
  password: string;
}
