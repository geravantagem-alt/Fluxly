import { redirect } from "next/navigation";

import { ColaboradoresTable } from "@/components/colaboradores/colaboradores-table";
import { getServerSessionUser } from "@/lib/supabase/server";

export default async function ColaboradoresPage() {
  const user = await getServerSessionUser();
  if (!user || user.role !== "owner") {
    redirect("/dashboard");
  }

  return <ColaboradoresTable />;
}
