import type { Metadata } from "next";

import { MissionControl } from "@/components/workspace/mission-control";
import { getDashboardData } from "@/lib/repair/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Mission control" };

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <MissionControl
      queue={data.queue}
      openCount={data.openCount}
      readyCount={data.readyCount}
      revenueMtd={data.revenueMtd}
      lowStockCount={data.lowStock.length}
    />
  );
}
