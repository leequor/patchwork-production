import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { DeviceStageMount } from "@/components/three/device-stage-mount";
import { DEVICE_FORMS } from "@/lib/device-form";
import { TICKET_STATUSES } from "@/lib/repair/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Stage preview" };

/**
 * Every stage of the bench scene at once, for art direction. Local only.
 */
export default function StagePreviewPage() {
  if (process.env.NEXT_PUBLIC_DESIGN_PREVIEW !== "true") {
    notFound();
  }

  return (
    <main className="min-h-[100dvh] bg-canvas px-6 py-8">
      <h1 className="display text-2xl text-ink">Bench stage — all states</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">        {TICKET_STATUSES.map((status) => (
          <section key={status} className="rounded-lg bg-panel/60 p-2">
            <DeviceStageMount status={status} className="h-[420px] w-full" />
            <p className="mt-1 px-2 pb-1 font-mono text-2xs uppercase tracking-[0.16em] text-ink-tertiary">
              {status}
            </p>
          </section>
        ))}
      </div>

      <h2 className="display mt-10 text-xl text-ink">Device forms — open on the bench</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {DEVICE_FORMS.map((form) => (
          <section key={form} className="rounded-lg bg-panel/60 p-2">
            <DeviceStageMount status="in_repair" form={form} className="h-[440px] w-full" />
            <p className="mt-1 px-2 pb-1 font-mono text-2xs uppercase tracking-[0.16em] text-ink-tertiary">
              {form}
            </p>
          </section>
        ))}
      </div>
    </main>
  );
}
