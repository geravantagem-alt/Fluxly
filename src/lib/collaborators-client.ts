import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export interface CollaboratorItem {
  id: string;
  name: string;
  email: string;
  assignedAreaIds: string[];
  assignedAreaNames: string[];
  assignedProcessIds: string[];
  assignedProcessNames: string[];
}

export interface AreaOption {
  id: string;
  nome: string;
}

export interface ProcessOption {
  id: string;
  nome: string;
  areaId: string;
  areaNome: string;
}

async function getBearerToken() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase nao configurado.");

  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Sessao expirada. Faca login novamente.");
  return token;
}

async function apiFetch(path: string, init?: RequestInit) {
  const token = await getBearerToken();
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {})
    }
  });

  const payload = (await response.json().catch(() => null)) as { error?: string } | null;
  if (!response.ok) {
    throw new Error(payload?.error || "Falha na requisicao de colaboradores.");
  }

  return payload;
}

export async function listCollaborators() {
  const data = (await apiFetch("/api/collaborators")) as {
    collaborators: CollaboratorItem[];
    areaOptions: AreaOption[];
    processOptions: ProcessOption[];
  };
  return data;
}

export async function createCollaborator(payload: {
  email: string;
  password: string;
  name?: string;
  areaIds?: string[];
  processIds?: string[];
}) {
  await apiFetch("/api/collaborators", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateCollaborator(
  id: string,
  payload: {
    email?: string;
    name?: string;
    areaIds?: string[];
    processIds?: string[];
  }
) {
  await apiFetch(`/api/collaborators/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export async function deleteCollaborator(id: string) {
  await apiFetch(`/api/collaborators/${id}`, { method: "DELETE" });
}
