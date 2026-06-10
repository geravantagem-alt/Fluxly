import { NextResponse, type NextRequest } from "next/server";
import { ApiError, findAuthUserByEmail, requireOwnerContext } from "./_utils";

interface CreateCollaboratorBody {
  email?: string;
  password?: string;
  name?: string;
  areaIds?: string[];
  processIds?: string[];
}

export async function GET(req: NextRequest) {
  try {
    const { empresaId, userClient } = await requireOwnerContext(req);

    const { data: collaborators, error: collaboratorsError } = await userClient
      .from("perfis")
      .select("id, email, nome_completo")
      .eq("empresa_id", empresaId)
      .eq("cargo", "colaborador")
      .order("nome_completo", { ascending: true });
    if (collaboratorsError) throw new ApiError(400, collaboratorsError.message);

    const { data: areas, error: areasError } = await userClient
      .from("areas")
      .select("id, nome")
      .eq("empresa_id", empresaId)
      .order("nome", { ascending: true });
    if (areasError) throw new ApiError(400, areasError.message);

    const { data: processos, error: processosError } = await userClient
      .from("processos")
      .select("id, nome, area_id, areas!inner(id, nome, empresa_id)")
      .order("nome", { ascending: true });
    if (processosError) throw new ApiError(400, processosError.message);

    const { data: areaLinks, error: linksError } = await userClient
      .from("area_colaboradores")
      .select("area_id, colaborador_id");
    if (linksError) throw new ApiError(400, linksError.message);

    const { data: processLinks, error: processLinksError } = await userClient
      .from("processo_colaboradores")
      .select("processo_id, colaborador_id");
    if (processLinksError) throw new ApiError(400, processLinksError.message);

    const areaById = new Map((areas ?? []).map((area) => [area.id, area.nome]));
    const areaIdsByCollaborator = new Map<string, string[]>();
    const processMetaById = new Map(
      (processos ?? []).map((processo) => [
        processo.id,
        {
          nome: processo.nome,
          areaNome: Array.isArray(processo.areas) ? processo.areas[0]?.nome ?? "Area" : processo.areas?.nome ?? "Area"
        }
      ])
    );
    const processIdsByCollaborator = new Map<string, string[]>();

    (areaLinks ?? []).forEach((link) => {
      const current = areaIdsByCollaborator.get(link.colaborador_id) ?? [];
      current.push(link.area_id);
      areaIdsByCollaborator.set(link.colaborador_id, current);
    });

    (processLinks ?? []).forEach((link) => {
      const current = processIdsByCollaborator.get(link.colaborador_id) ?? [];
      current.push(link.processo_id);
      processIdsByCollaborator.set(link.colaborador_id, current);
    });

    return NextResponse.json({
      collaborators: (collaborators ?? []).map((item) => {
        const assignedAreaIds = areaIdsByCollaborator.get(item.id) ?? [];
        const assignedProcessIds = processIdsByCollaborator.get(item.id) ?? [];
        return {
          id: item.id,
          name: item.nome_completo,
          email: item.email,
          assignedAreaIds,
          assignedAreaNames: assignedAreaIds.map((id) => areaById.get(id)).filter(Boolean),
          assignedProcessIds,
          assignedProcessNames: assignedProcessIds
            .map((id) => {
              const process = processMetaById.get(id);
              if (!process) return null;
              return `${process.areaNome} - ${process.nome}`;
            })
            .filter(Boolean)
        };
      }),
      areaOptions: areas ?? [],
      processOptions: (processos ?? []).map((processo) => ({
        id: processo.id,
        nome: processo.nome,
        areaId: processo.area_id,
        areaNome: Array.isArray(processo.areas) ? processo.areas[0]?.nome ?? "Area" : processo.areas?.nome ?? "Area"
      }))
    });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Erro interno.";
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { empresaId, userClient, adminClient } = await requireOwnerContext(req);
    const body = (await req.json()) as CreateCollaboratorBody;

    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password?.trim() ?? "";
    const name = body.name?.trim() || email.split("@")[0] || "Colaborador Fluxly";
    const areaIds = Array.isArray(body.areaIds) ? [...new Set(body.areaIds)] : [];
    const processIds = Array.isArray(body.processIds) ? [...new Set(body.processIds)] : [];

    if (!email) throw new ApiError(400, "Email obrigatorio.");
    if (!password || password.length < 6) throw new ApiError(400, "Senha temporaria deve ter ao menos 6 caracteres.");

    const { data: existingProfile } = await adminClient
      .from("perfis")
      .select("id, empresa_id")
      .ilike("email", email)
      .maybeSingle();

    let collaboratorId: string;

    if (existingProfile?.empresa_id === empresaId) {
      throw new ApiError(409, "Este email ja pertence a um colaborador desta empresa.");
    }

    if (existingProfile?.empresa_id && existingProfile.empresa_id !== empresaId) {
      throw new ApiError(409, "Este email ja esta vinculado a outra empresa.");
    }

    if (existingProfile?.id) {
      collaboratorId = existingProfile.id;
      const { error: attachError } = await adminClient
        .from("perfis")
        .update({ empresa_id: empresaId, cargo: "colaborador", nome_completo: name, email })
        .eq("id", collaboratorId);
      if (attachError) throw new ApiError(400, attachError.message);
    } else {
      const { data: createdUser, error: createUserError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: name,
          role: "collaborator"
        }
      });

      if (createUserError) {
        if (!createUserError.message.toLowerCase().includes("already")) {
          throw new ApiError(400, createUserError.message);
        }

        const existingAuthUser = await findAuthUserByEmail(adminClient, email);
        if (!existingAuthUser) throw new ApiError(400, "Nao foi possivel localizar usuario existente no auth.");
        collaboratorId = existingAuthUser.id;
      } else {
        collaboratorId = createdUser.user.id;
      }

      const { error: profileUpsertError } = await adminClient
        .from("perfis")
        .upsert(
          {
            id: collaboratorId,
            email,
            nome_completo: name,
            cargo: "colaborador",
            empresa_id: empresaId
          },
          { onConflict: "id" }
        );

      if (profileUpsertError) throw new ApiError(400, profileUpsertError.message);
    }

    if (areaIds.length > 0) {
      const { data: validAreas, error: areasValidationError } = await userClient
        .from("areas")
        .select("id")
        .eq("empresa_id", empresaId)
        .in("id", areaIds);

      if (areasValidationError) throw new ApiError(400, areasValidationError.message);
      if ((validAreas ?? []).length !== areaIds.length) throw new ApiError(400, "Uma ou mais areas informadas nao pertencem a empresa.");

      const { error: linkError } = await userClient.from("area_colaboradores").insert(
        areaIds.map((areaId) => ({
          area_id: areaId,
          colaborador_id: collaboratorId
        }))
      );
      if (linkError) throw new ApiError(400, linkError.message);
    }

    if (processIds.length > 0) {
      const { data: validProcessos, error: processValidationError } = await userClient
        .from("processos")
        .select("id, areas!inner(empresa_id)")
        .in("id", processIds);

      if (processValidationError) throw new ApiError(400, processValidationError.message);

      const validatedIds = (validProcessos ?? []).filter((processo) => {
        const areaData = Array.isArray(processo.areas) ? processo.areas[0] : processo.areas;
        return areaData?.empresa_id === empresaId;
      });

      if (validatedIds.length !== processIds.length) {
        throw new ApiError(400, "Um ou mais processos informados nao pertencem a empresa.");
      }

      const { error: processLinkError } = await userClient.from("processo_colaboradores").insert(
        processIds.map((processId) => ({
          processo_id: processId,
          colaborador_id: collaboratorId
        }))
      );
      if (processLinkError) throw new ApiError(400, processLinkError.message);
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Erro interno.";
    return NextResponse.json({ error: message }, { status });
  }
}
