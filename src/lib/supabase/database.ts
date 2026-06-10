import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export interface DbArea {
  id: string;
  nome: string;
  empresa_id: string;
  criado_em: string;
}

export interface DbProcesso {
  id: string;
  nome: string;
  area_id: string;
  criado_em: string;
}

export interface DbEtapa {
  id: string;
  titulo: string;
  descricao: string | null;
  ordem: number;
  processo_id: string;
}

export interface DbCollaborator {
  id: string;
  nome_completo: string;
  email: string;
}

export async function fetchProcessAccess(processoId: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const [{ data: role, error: roleError }, { data: canEdit, error: accessError }] = await Promise.all([
    supabase.rpc("current_user_role"),
    supabase.rpc("can_edit_processo", { target_processo_id: processoId })
  ]);

  if (roleError) throw roleError;
  if (accessError) throw accessError;

  return {
    role,
    canEdit: Boolean(canEdit)
  };
}

export async function fetchAreas() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase.from("areas").select("id, nome, empresa_id, criado_em").order("criado_em", { ascending: false });
  if (error) throw error;
  return data as DbArea[];
}

export async function createArea(payload: { nome: string }) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data: empresaId, error: companyError } = await supabase.rpc("current_empresa_id");
  if (companyError) throw companyError;
  if (!empresaId) throw new Error("Usuario sem empresa vinculada.");

  const { data, error } = await supabase
    .from("areas")
    .insert({ nome: payload.nome, empresa_id: empresaId })
    .select("id, nome, empresa_id, criado_em")
    .single();
  if (error) throw error;
  return data as DbArea;
}

export async function updateArea(payload: { areaId: string; nome: string }) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("areas")
    .update({ nome: payload.nome })
    .eq("id", payload.areaId)
    .select("id, nome, empresa_id, criado_em")
    .single();
  if (error) throw error;
  return data as DbArea;
}

export async function deleteArea(areaId: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;

  const { error } = await supabase.from("areas").delete().eq("id", areaId);
  if (error) throw error;
  return true;
}

export async function countProcessosByArea() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase.from("processos").select("area_id");
  if (error) throw error;

  const counts = new Map<string, number>();
  data.forEach((item) => {
    counts.set(item.area_id, (counts.get(item.area_id) ?? 0) + 1);
  });
  return counts;
}

export async function fetchCompanyCollaborators() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data: empresaId, error: companyError } = await supabase.rpc("current_empresa_id");
  if (companyError) throw companyError;
  if (!empresaId) return [];

  const { data, error } = await supabase
    .from("perfis")
    .select("id, nome_completo, email")
    .eq("empresa_id", empresaId)
    .eq("cargo", "colaborador")
    .order("nome_completo", { ascending: true });
  if (error) throw error;
  return data as DbCollaborator[];
}

export async function fetchAreaCollaboratorMap() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase.from("area_colaboradores").select("area_id, colaborador_id");
  if (error) throw error;

  const mapping = new Map<string, string[]>();
  data.forEach((item) => {
    const current = mapping.get(item.area_id) ?? [];
    current.push(item.colaborador_id);
    mapping.set(item.area_id, current);
  });
  return mapping;
}

export async function replaceAreaCollaborators(areaId: string, collaboratorIds: string[]) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;

  const uniqueIds = [...new Set(collaboratorIds)];
  const { error: deleteError } = await supabase.from("area_colaboradores").delete().eq("area_id", areaId);
  if (deleteError) throw deleteError;

  if (uniqueIds.length === 0) return true;

  const { error: insertError } = await supabase.from("area_colaboradores").insert(
    uniqueIds.map((collaboratorId) => ({
      area_id: areaId,
      colaborador_id: collaboratorId
    }))
  );
  if (insertError) throw insertError;
  return true;
}

export async function fetchProcessosByArea(areaId: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase.from("processos").select("id, nome, area_id, criado_em").eq("area_id", areaId);
  if (error) throw error;
  return data as DbProcesso[];
}

export async function fetchProcessoById(processoId: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase.from("processos").select("id, nome, area_id, criado_em").eq("id", processoId).single();
  if (error) throw error;
  return data as DbProcesso;
}

export async function createProcesso(payload: { areaId: string; nome: string }) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase.from("processos").insert({ area_id: payload.areaId, nome: payload.nome }).select("id, nome, area_id, criado_em").single();
  if (error) throw error;
  return data as DbProcesso;
}

export async function updateProcesso(payload: { processoId: string; nome: string }) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("processos")
    .update({ nome: payload.nome })
    .eq("id", payload.processoId)
    .select("id, nome, area_id, criado_em")
    .single();
  if (error) throw error;
  return data as DbProcesso;
}

export async function deleteProcesso(processoId: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;

  const { error } = await supabase.from("processos").delete().eq("id", processoId);
  if (error) throw error;
  return true;
}

export async function fetchProcessoCollaboratorMap(areaId?: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  let query = supabase.from("processo_colaboradores").select("processo_id, colaborador_id");
  if (areaId) {
    const { data: processos, error: processError } = await supabase.from("processos").select("id").eq("area_id", areaId);
    if (processError) throw processError;
    const ids = (processos ?? []).map((item) => item.id);
    if (ids.length === 0) return new Map<string, string[]>();
    query = query.in("processo_id", ids);
  }

  const { data, error } = await query;
  if (error) throw error;

  const mapping = new Map<string, string[]>();
  data.forEach((item) => {
    const current = mapping.get(item.processo_id) ?? [];
    current.push(item.colaborador_id);
    mapping.set(item.processo_id, current);
  });
  return mapping;
}

export async function replaceProcessoCollaborators(processoId: string, collaboratorIds: string[]) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;

  const uniqueIds = [...new Set(collaboratorIds)];
  const { error: deleteError } = await supabase.from("processo_colaboradores").delete().eq("processo_id", processoId);
  if (deleteError) throw deleteError;

  if (uniqueIds.length === 0) return true;

  const { error: insertError } = await supabase.from("processo_colaboradores").insert(
    uniqueIds.map((collaboratorId) => ({
      processo_id: processoId,
      colaborador_id: collaboratorId
    }))
  );
  if (insertError) throw insertError;
  return true;
}

export async function fetchEtapasByProcesso(processoId: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase.from("etapas_fluxograma").select("id, titulo, descricao, ordem, processo_id").eq("processo_id", processoId).order("ordem", { ascending: true });
  if (error) throw error;
  return data as DbEtapa[];
}

export async function createEtapa(payload: { processoId: string; titulo: string; descricao: string; ordem: number }) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("etapas_fluxograma")
    .insert({
      processo_id: payload.processoId,
      titulo: payload.titulo,
      descricao: payload.descricao || null,
      ordem: payload.ordem
    })
    .select("id, titulo, descricao, ordem, processo_id")
    .single();

  if (error) throw error;
  return data as DbEtapa;
}

export async function updateEtapa(payload: { etapaId: string; titulo: string; descricao: string }) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("etapas_fluxograma")
    .update({
      titulo: payload.titulo,
      descricao: payload.descricao || null
    })
    .eq("id", payload.etapaId)
    .select("id, titulo, descricao, ordem, processo_id")
    .single();

  if (error) throw error;
  return data as DbEtapa;
}

async function persistEtapaOrders(etapas: Array<{ id: string }>) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;

  for (let index = 0; index < etapas.length; index += 1) {
    const etapa = etapas[index];
    const temporaryOrder = etapas.length + index + 1;
    const { error } = await supabase.from("etapas_fluxograma").update({ ordem: temporaryOrder }).eq("id", etapa.id);
    if (error) throw error;
  }

  for (let index = 0; index < etapas.length; index += 1) {
    const etapa = etapas[index];
    const finalOrder = index + 1;
    const { error } = await supabase.from("etapas_fluxograma").update({ ordem: finalOrder }).eq("id", etapa.id);
    if (error) throw error;
  }
}

export async function reorderEtapas(payload: { processoId: string; orderedEtapaIds: string[] }) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("etapas_fluxograma")
    .select("id")
    .eq("processo_id", payload.processoId)
    .order("ordem", { ascending: true });
  if (error) throw error;

  const existingIds = new Set((data ?? []).map((item) => item.id));
  const ordered = payload.orderedEtapaIds.filter((id) => existingIds.has(id)).map((id) => ({ id }));

  if (ordered.length !== existingIds.size) {
    throw new Error("Nao foi possivel reordenar as etapas deste processo.");
  }

  await persistEtapaOrders(ordered);

  const { data: updated, error: refetchError } = await supabase
    .from("etapas_fluxograma")
    .select("id, titulo, descricao, ordem, processo_id")
    .eq("processo_id", payload.processoId)
    .order("ordem", { ascending: true });
  if (refetchError) throw refetchError;

  return updated as DbEtapa[];
}

export async function deleteEtapa(etapaId: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;

  const { error } = await supabase.from("etapas_fluxograma").delete().eq("id", etapaId);
  if (error) throw error;
  return true;
}

export async function deleteEtapaAndReorder(payload: { etapaId: string; processoId: string }) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { error } = await supabase.from("etapas_fluxograma").delete().eq("id", payload.etapaId);
  if (error) throw error;

  const { data: remaining, error: remainingError } = await supabase
    .from("etapas_fluxograma")
    .select("id, titulo, descricao, ordem, processo_id")
    .eq("processo_id", payload.processoId)
    .order("ordem", { ascending: true });
  if (remainingError) throw remainingError;

  const normalized = remaining ?? [];
  await persistEtapaOrders(normalized.map((item) => ({ id: item.id })));

  const { data: updated, error: refetchError } = await supabase
    .from("etapas_fluxograma")
    .select("id, titulo, descricao, ordem, processo_id")
    .eq("processo_id", payload.processoId)
    .order("ordem", { ascending: true });
  if (refetchError) throw refetchError;

  return updated as DbEtapa[];
}

export async function fetchDashboardKpis() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const [areasResult, processosResult, etapasResult] = await Promise.all([
    supabase.from("areas").select("id", { count: "exact", head: true }),
    supabase.from("processos").select("id", { count: "exact", head: true }),
    supabase.from("etapas_fluxograma").select("id", { count: "exact", head: true })
  ]);

  if (areasResult.error) throw areasResult.error;
  if (processosResult.error) throw processosResult.error;
  if (etapasResult.error) throw etapasResult.error;

  return {
    areasAtivas: areasResult.count ?? 0,
    processos: processosResult.count ?? 0,
    etapasMapeadas: etapasResult.count ?? 0
  };
}
