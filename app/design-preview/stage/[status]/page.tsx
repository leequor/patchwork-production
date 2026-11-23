import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { DeviceStageMount } from "@/components/three/device-stage-mount";
import { TICKET_STATUSES, type TicketStatus } from "@/lib/repair/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Stage preview" };

/** One stage, large, for art direction. Local only. */
export default async function StageDetailPreviewPage({
  params,
}: {
  params: Promise<{ status: string }>;
}) {
  if (process.env.NEXT_PUBLIC_DESIGN_PREVIEW !== "true") {
    notFound();
  }

  const { status } = await params;
  if (!TICKET_STATUSES.includes(status as TicketStatus)) {
    notFound();
  }

  return (
    <main className="grid min-h-[100dvh] place-items-center bg-canvas p-6">
      <div className="w-full max-w-[760px]">
        <DeviceStageMount status={status as TicketStatus} className="h-[680px] w-full" />
        <p className="mt-2 text-center font-mono text-2xs uppercase tracking-[0.18em] text-ink-tertiary">
          {status}
        </p>
      </div>
    </main>
  );
}
