import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Settings, Users } from "lucide-react";
import type { UserRole } from "@/types";

export const APP_NAME = "Fluxly";

export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  dashboard: "/dashboard",
  colaboradores: "/colaboradores",
  configuracoes: "/configuracoes"
} as const;

export interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: UserRole[];
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  { label: "Areas", href: ROUTES.dashboard, icon: LayoutDashboard },
  { label: "Colaboradores", href: ROUTES.colaboradores, icon: Users, roles: ["owner"] },
  { label: "Configuracoes", href: ROUTES.configuracoes, icon: Settings }
];

export function getSidebarItems(role: UserRole) {
  return SIDEBAR_ITEMS.filter((item) => !item.roles || item.roles.includes(role));
}
