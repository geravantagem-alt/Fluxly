import { AreasGrid } from "@/components/areas/areas-grid";
import { OverviewKpis } from "@/components/dashboard/overview-kpis";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <OverviewKpis />
      <AreasGrid />
    </div>
  );
}