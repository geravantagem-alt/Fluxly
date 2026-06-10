import { notFound } from "next/navigation";

import { FlowEditor } from "@/components/flowchart/flow-editor";
import { getServerProcessoById } from "@/lib/supabase/server";

export default async function ProcessFlowPage({ params }: { params: { processId: string } }) {
  const processo = await getServerProcessoById(params.processId);

  if (!processo) {
    notFound();
  }

  return <FlowEditor processId={params.processId} processName={processo.nome} />;
}
