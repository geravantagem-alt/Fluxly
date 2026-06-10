import { notFound } from "next/navigation";

import { ProcessosGrid } from "@/components/processos/processos-grid";
import { getServerAreaById } from "@/lib/supabase/server";

export default async function AreaPage({ params }: { params: { areaId: string } }) {
  const area = await getServerAreaById(params.areaId);
  if (!area) {
    notFound();
  }

  return <ProcessosGrid areaId={params.areaId} />;
}
