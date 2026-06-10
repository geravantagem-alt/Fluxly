"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/ui";
import { fetchDashboardKpis } from "@/lib/supabase/database";

export function OverviewKpis() {
  const [items, setItems] = useState([
    { label: "Areas ativas", value: "-" },
    { label: "Processos", value: "-" },
    { label: "Etapas mapeadas", value: "-" }
  ]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchDashboardKpis();
        if (!data) return;
        setItems([
          { label: "Areas ativas", value: String(data.areasAtivas) },
          { label: "Processos", value: String(data.processos) },
          { label: "Etapas mapeadas", value: String(data.etapasMapeadas) }
        ]);
      } catch {
        setItems([
          { label: "Areas ativas", value: "-" },
          { label: "Processos", value: "-" },
          { label: "Etapas mapeadas", value: "-" }
        ]);
      }
    };

    void load();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item) => (
        <Card className="p-4" key={item.label}>
          <p className="text-xs uppercase text-flux-muted">{item.label}</p>
          <p className="mt-1 text-3xl font-bold text-flux-primary">{item.value}</p>
        </Card>
      ))}
    </div>
  );
}
