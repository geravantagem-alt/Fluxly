import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import type { Database } from "@/types";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export interface OwnerContext {
  userId: string;
  empresaId: string;
  userClient: ReturnType<typeof createClient<Database>>;
  adminClient: ReturnType<typeof createClient<Database>>;
}

function getEnvValue(key: string) {
  const value = process.env[key];
  if (!value) throw new ApiError(500, `Variavel de ambiente ausente: ${key}`);
  return value;
}

export function getBearerToken(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.toLowerCase().startsWith("bearer ")) {
    throw new ApiError(401, "Token de autenticacao ausente.");
  }
  return authHeader.slice(7);
}

export function createUserScopedClient(accessToken: string) {
  const url = getEnvValue("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = getEnvValue("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } }
  });
}

export function createAdminClient() {
  const url = getEnvValue("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRole = getEnvValue("SUPABASE_SERVICE_ROLE_KEY");
  return createClient<Database>(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

export async function requireOwnerContext(req: NextRequest): Promise<OwnerContext> {
  const token = getBearerToken(req);
  const userClient = createUserScopedClient(token);
  const adminClient = createAdminClient();

  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  if (userError || !userData.user) throw new ApiError(401, "Usuario nao autenticado.");

  const { data: profile, error: profileError } = await userClient
    .from("perfis")
    .select("empresa_id, cargo")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profileError) throw new ApiError(403, profileError.message);
  if (!profile?.empresa_id) throw new ApiError(403, "Usuario sem empresa vinculada.");
  if (profile.cargo !== "dono") throw new ApiError(403, "Apenas o dono pode gerenciar colaboradores.");

  return {
    userId: userData.user.id,
    empresaId: profile.empresa_id,
    userClient,
    adminClient
  };
}

export async function findAuthUserByEmail(adminClient: ReturnType<typeof createClient<Database>>, email: string) {
  const target = email.trim().toLowerCase();
  let page = 1;
  const perPage = 200;

  for (;;) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage });
    if (error) throw new ApiError(500, error.message);

    const found = data.users.find((user) => user.email?.toLowerCase() === target);
    if (found) return found;

    if (data.users.length < perPage) break;
    page += 1;
  }

  return null;
}
