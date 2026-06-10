import type { User } from "@/types";
import {
  clearBrowserSession,
  hasStoredBrowserSession,
  persistBrowserSession,
  readStoredBrowserUser,
  updateStoredBrowserUser
} from "@/lib/auth-storage";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function mapSupabaseUserToAppUser(user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }): User {
  const name = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "Usuario Fluxly";
  const role = user.user_metadata?.role === "collaborator" ? "collaborator" : "owner";

  return {
    id: user.id,
    name,
    email: user.email ?? "",
    role
  };
}

function mapSupabaseLoginError(message?: string) {
  if (!message) return "Falha no login. Tente novamente.";

  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) return "Email ou senha incorretos.";
  if (normalized.includes("email not confirmed")) return "Email ainda nao confirmado. Verifique sua caixa de entrada.";
  if (normalized.includes("invalid email")) return "Email invalido.";

  return message;
}

export async function logout() {
  if (typeof window === "undefined") return;
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    await supabase.auth.signOut();
  }

  clearBrowserSession();
}

export function hasActiveSession() {
  return hasStoredBrowserSession();
}

export function getSessionUser(fallback: User): User {
  return readStoredBrowserUser(fallback);
}

export async function ensureSessionFromSupabase() {
  if (typeof window === "undefined") return false;
  if (hasActiveSession()) return true;

  if (!isSupabaseConfigured()) return false;
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;

  const { data } = await supabase.auth.getSession();
  if (!data.session?.user) return false;

  await ensureWorkspaceForOwner(data.session.user);

  const user = mapSupabaseUserToAppUser(data.session.user);
  persistBrowserSession({
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    user
  });
  return true;
}

export async function loginWithCredentials(params: { email: string; password: string }) {
  const email = params.email.trim();
  const password = params.password.trim();

  if (!email || !password) {
    return { ok: false as const, message: "Informe email e senha." };
  }

  const supabase = getSupabaseBrowserClient();
  if (!isSupabaseConfigured() || !supabase) {
    return {
      ok: false as const,
      message: "Supabase nao configurado no app. Verifique .env.local e reinicie o servidor (npm run dev)."
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false as const, message: mapSupabaseLoginError(error.message) };
  }

  if (!data.user) {
    return { ok: false as const, message: "Falha no login. Usuario nao retornado pelo Supabase." };
  }

  await ensureWorkspaceForOwner(data.user);

  const user = mapSupabaseUserToAppUser(data.user);
  if (!data.session?.access_token || !data.session.refresh_token) {
    return { ok: false as const, message: "Falha no login. Sessao invalida retornada pelo Supabase." };
  }

  persistBrowserSession({
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    user
  });
  return { ok: true as const, user };
}

export async function ensureWorkspaceForOwner(user: { id: string; user_metadata?: Record<string, unknown> }) {
  const metadata = user.user_metadata ?? {};
  if (metadata.role !== "owner") return;

  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;

  const fullName = typeof metadata.full_name === "string" ? metadata.full_name : "Usuario Fluxly";
  const role = metadata.role === "owner" ? "dono" : "colaborador";

  // Repair path: if trigger auth->perfis failed for any reason, bootstrap profile.
  const { error: bootstrapError } = await supabase.rpc("bootstrap_current_profile", {
    full_name_input: fullName,
    role_input: role
  });
  if (bootstrapError && !bootstrapError.message.toLowerCase().includes("does not exist")) {
    console.warn("bootstrap_current_profile error:", bootstrapError.message);
  }

  const { data: perfil } = await supabase.from("perfis").select("empresa_id").eq("id", user.id).maybeSingle();
  if (perfil?.empresa_id) return;

  const companyName = typeof metadata.company_name === "string" ? metadata.company_name.trim() : "";
  const cnpjRaw = typeof metadata.cnpj === "string" ? metadata.cnpj : "";
  const cnpj = cnpjRaw.replace(/\D/g, "");

  if (!companyName || !cnpj) return;

  const { error } = await supabase.from("empresas").insert({
    dono_id: user.id,
    nome: companyName,
    cnpj
  });

  if (error && !error.message.toLowerCase().includes("duplicate")) {
    console.warn("ensureWorkspaceForOwner error:", error.message);
  }
}

export async function createOwnerAndLogin(payload: {
  name: string;
  email: string;
  password: string;
  companyName: string;
  cnpj: string;
}) {
  const { name, email, password, companyName, cnpj } = payload;

  const supabase = getSupabaseBrowserClient();
  if (!isSupabaseConfigured() || !supabase) {
    return {
      ok: false as const,
      message: "Supabase nao configurado no app. Verifique .env.local e reinicie o servidor (npm run dev)."
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        role: "owner",
        company_name: companyName,
        cnpj
      }
    }
  });

  if (error) {
    return { ok: false as const, message: error.message || "Falha ao criar conta no Supabase." };
  }

  if (data.user && data.session) {
    const normalizedCnpj = cnpj.replace(/\D/g, "");
    const { error: companyError } = await supabase.from("empresas").insert({
      dono_id: data.user.id,
      nome: companyName,
      cnpj: normalizedCnpj || cnpj
    });

    if (companyError) {
      return { ok: false as const, message: companyError.message || "Conta criada, mas falhou ao criar empresa." };
    }

    const user = mapSupabaseUserToAppUser(data.user);
    persistBrowserSession({
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user
    });
    return { ok: true as const, user };
  }

  return {
    ok: true as const,
    pendingConfirmation: true as const,
    message: "Conta criada. Confirme seu email para concluir o acesso."
  };
}

export function getLocalCompanyByUserId(_userId: string): { companyName: string; cnpj: string } | null {
  return null;
}

export function updateLocalAccount(_userId: string, payload: { name?: string; password?: string; companyName?: string; cnpj?: string }) {
  updateStoredBrowserUser(payload);
}

export async function fetchCurrentSettings() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;

  const { data: perfil, error: perfilError } = await supabase
    .from("perfis")
    .select("nome_completo, cargo, empresa_id")
    .eq("id", user.id)
    .maybeSingle();
  if (perfilError) throw perfilError;

  let empresa: { nome: string; cnpj: string } | null = null;
  if (perfil?.empresa_id) {
    const { data: empresaData, error: empresaError } = await supabase
      .from("empresas")
      .select("nome, cnpj")
      .eq("id", perfil.empresa_id)
      .maybeSingle();
    if (empresaError) throw empresaError;
    if (empresaData) empresa = empresaData;
  }

  return {
    nomeCompleto: perfil?.nome_completo ?? (user.user_metadata?.full_name as string | undefined) ?? "",
    role: perfil?.cargo === "dono" ? "owner" : "collaborator",
    empresa
  };
}

export async function updateCurrentProfileName(name: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase indisponivel.");

  const trimmed = name.trim();
  if (!trimmed) throw new Error("Nome obrigatorio.");

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) throw new Error("Usuario nao autenticado.");

  const { error } = await supabase.from("perfis").update({ nome_completo: trimmed }).eq("id", user.id);
  if (error) throw error;

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      ...user.user_metadata,
      full_name: trimmed
    }
  });
  if (authError) throw authError;

  updateStoredBrowserUser({ name: trimmed });
}

export async function updateCurrentPassword(newPassword: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase indisponivel.");

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function updateCurrentCompany(payload: { name: string; cnpj: string }) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase indisponivel.");

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) throw new Error("Usuario nao autenticado.");

  const nome = payload.name.trim();
  const cnpj = payload.cnpj.replace(/\D/g, "");
  if (!nome || !cnpj) throw new Error("Nome e CNPJ sao obrigatorios.");

  const { data: empresaAtual } = await supabase.from("empresas").select("id").eq("dono_id", user.id).maybeSingle();

  if (empresaAtual?.id) {
    const { error: updateError } = await supabase.from("empresas").update({ nome, cnpj }).eq("id", empresaAtual.id);
    if (updateError) throw updateError;
  } else {
    const { error: insertError } = await supabase.from("empresas").insert({ dono_id: user.id, nome, cnpj });
    if (insertError) throw insertError;
  }

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      ...user.user_metadata,
      company_name: nome,
      cnpj
    }
  });
  if (authError) throw authError;
}
