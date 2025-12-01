import { type AcademyUser, type ActivityLog, type AvailabilitySlot, type DashboardStat } from "./types";

export const dashboardStats: DashboardStat[] = [
  {
    label: "Taxa de ocupação",
    value: "82%",
    helper: "+6% vs. última semana",
    trend: 6,
  },
  {
    label: "Receita prevista",
    value: "R$ 42,7 mil",
    helper: "12 reservas premium",
    trend: 12,
  },
  {
    label: "Novos alunos",
    value: "+18",
    helper: "Triagem concluída",
    trend: 4,
  },
  {
    label: "Casos pendentes",
    value: "7",
    helper: "Precisa de atenção",
    trend: -3,
  },
];

export const academyUsers: AcademyUser[] = [
  {
    id: 71,
    name: "Lívia Azevedo",
    role: "player",
    rating: 4.5,
    email: "livia@acebook.club",
    phone: "+55 11 98888-8765",
    plan: "premium",
    availability: ["seg", "qua", "sex"],
  },
  {
    id: 72,
    name: "Equipe Técnica",
    role: "admin",
    rating: 4.9,
    email: "tecnica@acebook.club",
    phone: "+55 11 91234-5555",
    plan: "mensal",
    availability: ["seg", "ter", "qui"],
  },
  {
    id: 73,
    name: "Equipe Torneio",
    role: "admin",
    rating: 0,
    email: "eventos@acebook.club",
    phone: "+55 11 90000-0000",
    plan: "premium",
    availability: ["todos"],
  },
];

export const availabilityGrid: AvailabilitySlot[] = [
  { day: "Seg", start: "06:00", end: "12:00", audience: "adulto" },
  { day: "Seg", start: "18:00", end: "22:00", audience: "performance" },
  { day: "Ter", start: "07:00", end: "13:00", audience: "adulto" },
  { day: "Qua", start: "15:00", end: "22:00", audience: "adulto" },
  { day: "Qui", start: "06:00", end: "10:00", audience: "infantil" },
  { day: "Sex", start: "16:00", end: "22:00", audience: "performance" },
  { day: "Sab", start: "08:00", end: "14:00", audience: "adulto" },
];

export const activityFeed: ActivityLog[] = [
  {
    time: "há 8 min",
    message: "Reserva #5031 aguardando confirmação do treinador responsável",
    icon: "calendar",
    variant: "warning",
  },
  {
    time: "há 24 min",
    message: "Check-in automático realizado para quadra 3",
    icon: "check",
    variant: "success",
  },
  {
    time: "há 1h",
    message: "Pagamento confirmado - plano premium (R$ 780)",
    icon: "dollar-sign",
    variant: "default",
  },
  {
    time: "há 2h",
    message: "Quadra 4 bloqueada para manutenção preventiva",
    icon: "wrench",
    variant: "warning",
  },
];
