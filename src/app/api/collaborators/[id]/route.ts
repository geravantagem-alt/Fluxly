import { NextResponse, type NextRequest } from "next/server";
import { ApiError, requireOwnerContext } from "../_utils";

interface UpdateCollaboratorBody {
  email?: string;
  name?: string;
  areaIds?: string[];
  processIds?: string[];
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { empresaId, userClient, adminClient } = await requireOwnerContext(req);
    const collaboratorId = params.id;
    const body = (await req.json()) as UpdateCollaboratorBody;

    const { data: targetProfile, error: targetError } = await adminClient
      .from("perfis")
      .select("id, email, empresa_id, cargo")
      .eq("id", collaboratorId)
      .maybeSingle();

    if (targetError) throw new ApiError(400, targetError.message);
    if (!targetProfile || targetProfile.empresa_id !== empresaId || targetProfile.cargo !== "colaborador") {
      throw new ApiError(404, "Colaborador nao encontrado nesta empresa.");
    }

    const nextName = body.name?.trim();
    const nextEmail = body.email?.trim().toLowerCase();
    const nextAreaIds = Array.isArray(body.areaIds) ? [...new Set(body.areaIds)] : undefined;
    const nextProcessIds = Array.isArray(body.processIds) ? [...new Set(body.processIds)] : undefined;

    if (nextEmail && nextEmail !== targetProfile.email.toLowerCase()) {
      const { data: conflictProfile } = await adminClient
        .from("perfis")
        .select("id, empresa_id")
        .ilike("email", nextEmail)
        .neq("id", collaboratorId)
        .maybeSingle();

      if (conflictProfile?.empresa_id === empresaId) {
        throw new ApiError(409, "Este email ja pertence a outro colaborador da empresa.");
      }
      if (conflictProfile?.empresa_id && conflictProfile.empresa_id !== empresaId) {
        throw new ApiError(409, "Este email ja esta vinculado a outra empresa.");
      }

      const { error: authUpdateError } = await adminClient.auth.admin.updateUserById(collaboratorId, { email: nextEmail });
      if (authUpdateError) throw new ApiError(400, authUpdateError.message);
    }

    if (nextName || nextEmail) {
      const { error: updateProfileError } = await adminClient
        .from("perfis")
        .update({
          ...(nextName ? { nome_completo: nextName } : {}),
          ...(nextEmail ? { email: nextEmail } : {})
        })
        .eq("id", collaboratorId);
      if (updateProfileError) throw new ApiError(400, updateProfileError.message);
    }

    if (nextAreaIds) {
      if (nextAreaIds.length > 0) {
        const { data: validAreas, error: areasValidationError } = await userClient
          .from("areas")
          .select("id")
          .eq("empresa_id", empresaId)
          .in("id", nextAreaIds);
        if (areasValidationError) throw new ApiError(400, areasValidationError.message);
        if ((validAreas ?? []).length !== nextAreaIds.length) throw new ApiError(400, "Uma ou mais areas informadas nao pertencem a empresa.");
      }

      const { error: clearLinksError } = await userClient.from("area_colaboradores").delete().eq("colaborador_id", collaboratorId);
      if (clearLinksError) throw new ApiError(400, clearLinksError.message);

      if (nextAreaIds.length > 0) {
        const { error: insertLinksError } = await userClient.from("area_colaboradores").insert(
          nextAreaIds.map((areaId) => ({
            area_id: areaId,
            colaborador_id: collaboratorId
          }))
        );
        if (insertLinksError) throw new ApiError(400, insertLinksError.message);
      }
    }

    if (nextProcessIds) {
      if (nextProcessIds.length > 0) {
        const { data: validProcessos, error: processValidationError } = await userClient
          .from("processos")
          .select("id, areas!inner(empresa_id)")
          .in("id", nextProcessIds);
        if (processValidationError) throw new ApiError(400, processValidationError.message);

        const validatedIds = (validProcessos ?? []).filter((processo) => {
          const areaData = Array.isArray(processo.areas) ? processo.areas[0] : processo.areas;
          return areaData?.empresa_id === empresaId;
        });

        if (validatedIds.length !== nextProcessIds.length) {
          throw new ApiError(400, "Um ou mais processos informados nao pertencem a empresa.");
        }
      }

      const { error: clearProcessLinksError } = await userClient.from("processo_colaboradores").delete().eq("colaborador_id", collaboratorId);
      if (clearProcessLinksError) throw new ApiError(400, clearProcessLinksError.message);

      if (nextProcessIds.length > 0) {
        const { error: insertProcessLinksError } = await userClient.from("processo_colaboradores").insert(
          nextProcessIds.map((processId) => ({
            processo_id: processId,
            colaborador_id: collaboratorId
          }))
        );
        if (insertProcessLinksError) throw new ApiError(400, insertProcessLinksError.message);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Erro interno.";
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { empresaId, userClient, adminClient } = await requireOwnerContext(req);
    const collaboratorId = params.id;

    const { data: targetProfile, error: targetError } = await adminClient
      .from("perfis")
      .select("id, empresa_id, cargo")
      .eq("id", collaboratorId)
      .maybeSingle();
    if (targetError) throw new ApiError(400, targetError.message);
    if (!targetProfile || targetProfile.empresa_id !== empresaId || targetProfile.cargo !== "colaborador") {
      throw new ApiError(404, "Colaborador nao encontrado nesta empresa.");
    }

    const { error: deleteAreaLinksError } = await userClient.from("area_colaboradores").delete().eq("colaborador_id", collaboratorId);
    if (deleteAreaLinksError) throw new ApiError(400, deleteAreaLinksError.message);

    const { error: deleteProcessLinksError } = await userClient.from("processo_colaboradores").delete().eq("colaborador_id", collaboratorId);
    if (deleteProcessLinksError) throw new ApiError(400, deleteProcessLinksError.message);

    const { error: detachError } = await adminClient
      .from("perfis")
      .update({
        empresa_id: null,
        cargo: "colaborador"
      })
      .eq("id", collaboratorId);
    if (detachError) throw new ApiError(400, detachError.message);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Erro interno.";
    return NextResponse.json({ error: message }, { status });
  }
}
