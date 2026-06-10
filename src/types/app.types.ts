import type { Area, Etapa, Processo } from "./process.types";
import type { User } from "./user.types";

export type ToastVariant = "success" | "error" | "info";

export interface AppState {
  currentUser: User;
  users: User[];
  areas: Area[];
  processos: Processo[];
  etapas: Etapa[];
}