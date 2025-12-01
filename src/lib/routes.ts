import {
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  Users2,
} from "lucide-react";

export const marketingNav = [
  { label: "Recursos", href: "#recursos" },
  { label: "Planos", href: "#planos" },
  { label: "Clientes", href: "#cases" },
  { label: "Contato", href: "#contato" },
];

export const playerNavigation = [
  {
    label: "Reservas",
    href: "/dashboard/reservations",
    icon: CalendarDays,
  },
  {
    label: "Quadras",
    href: "/dashboard/courts",
    icon: ClipboardCheck,
  },
  {
    label: "Instrutores",
    href: "/dashboard/coaches",
    icon: GraduationCap,
  },
];

export const adminNavigation = [
  {
    label: "Reservas",
    href: "/dashboard/reservations",
    icon: CalendarDays,
  },
  {
    label: "Quadras",
    href: "/dashboard/courts",
    icon: ClipboardCheck,
  },
  {
    label: "Instrutores",
    href: "/dashboard/coaches",
    icon: GraduationCap,
  },
  {
    label: "Jogadores",
    href: "/dashboard/users",
    icon: Users2,
  },
];
