import type { AppState, Etapa, Processo, User } from "@/types";

export const users: User[] = [
  { id: "u-1", name: "Ricardo Alves", email: "ricardo@fluxly.com", role: "owner" },
  { id: "u-2", name: "Beatriz Santos", email: "beatriz@fluxly.com", role: "collaborator" },
  { id: "u-3", name: "Carlos Silva", email: "carlos@fluxly.com", role: "collaborator" },
  { id: "u-4", name: "Amanda Rocha", email: "amanda@fluxly.com", role: "collaborator" }
];

export const areas = [
  { id: "a-1", name: "Marketing", processCount: 3, description: "Aquisicao e nutricao de leads.", collaboratorIds: ["u-2", "u-3"] },
  { id: "a-2", name: "Financeiro", processCount: 2, description: "Rotinas de faturamento e contas.", collaboratorIds: ["u-3"] },
  { id: "a-3", name: "RH", processCount: 1, description: "Onboarding e rotinas de pessoal.", collaboratorIds: ["u-4"] }
];

export const processos: Processo[] = [
  { id: "p-1", areaId: "a-1", name: "Onboarding de Leads", updatedAt: "Hoje", assignedUserIds: ["u-2", "u-3"] },
  { id: "p-2", areaId: "a-1", name: "Campanha Mensal", updatedAt: "Ontem", assignedUserIds: ["u-2"] },
  { id: "p-3", areaId: "a-2", name: "Fechamento Mensal", updatedAt: "2 dias", assignedUserIds: ["u-3"] },
  { id: "p-4", areaId: "a-3", name: "Admissao", updatedAt: "1 semana", assignedUserIds: ["u-4"] }
];

export const etapas: Etapa[] = [
  { id: "e-1", processId: "p-1", order: 1, title: "Captura do lead", description: "Coletar dados em landing page." },
  { id: "e-2", processId: "p-1", order: 2, title: "Email inicial", description: "Enviar mensagem de boas-vindas." },
  { id: "e-3", processId: "p-1", order: 3, title: "Qualificacao", description: "Classificar lead com base em fit." },
  { id: "e-4", processId: "p-1", order: 4, title: "Passagem para vendas", description: "Criar tarefa para SDR." }
];

export const appState: AppState = {
  currentUser: users[0],
  users,
  areas,
  processos,
  etapas
};

export const authMock = {
  login: {
    ownerEmail: "ricardo@fluxly.com",
    collaboratorEmail: "beatriz@fluxly.com",
    password: "123456"
  }
};