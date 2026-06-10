import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { AUTH_STORAGE_KEYS } from "@/lib/auth-storage";
import type { Database } from "@/types";
import type { User } from "@/types";

function mapSupabaseUserToAppUser(user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }): User {
  const name = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "Usuario Fluxly";
  const role = user.user_metadata?.role === "collaborator" ? "collaborator" : "owner";

  return {
    id: user.id,
    name,
    email: user.email ?? "",
    role
  };
}

export function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  const cookieStore = cookies();
  const accessToken = cookieStore.get(AUTH_STORAGE_KEYS.accessToken)?.value;

  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    global: {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
    }
  });
}

async function getServerSupabaseSession() {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  const cookieStore = cookies();
  const accessToken = cookieStore.get(AUTH_STORAGE_KEYS.accessToken)?.value;
  const refreshToken = cookieStore.get(AUTH_STORAGE_KEYS.refreshToken)?.value;

  if (!accessToken || !refreshToken) return null;

  const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken
  });

  if (sessionError || !sessionData.user) return null;

  return {
    supabase,
    user: sessionData.user
  };
}

export async function getServerSessionUser() {
  const session = await getServerSupabaseSession();
  if (!session) return null;

  return mapSupabaseUserToAppUser(session.user);
}

export async function getServerAreaById(areaId: string) {
  const session = await getServerSupabaseSession();
  if (!session) return null;

  const { data, error } = await session.supabase
    .from("areas")
    .select("id, nome, empresa_id, criado_em")
    .eq("id", areaId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getServerProcessoById(processoId: string) {
  const session = await getServerSupabaseSession();
  if (!session) return null;

  const { data, error } = await session.supabase
    .from("processos")
    .select("id, nome, area_id, criado_em")
    .eq("id", processoId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
