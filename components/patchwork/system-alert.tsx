import { TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

/** A system alert that reads like telemetry, not a browser validation message. */
export function SystemAlert({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      role="alert"
      className="edge-lit relative overflow-hidden rounded-xl border border-[#f43f5e]/25 bg-[#f43f5e]/[0.07] px-4 py-3.5 shadow-[0_0_50px_-20px_rgba(244,63,94,0.55)] backdrop-blur-xl"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#f43f5e]/25 bg-[#f43f5e]/10">
          <TriangleAlert
            aria-hidden="true"
            className="h-4 w-4 text-[#fb7185]"
            strokeWidth={1.7}
          />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#fda4af]">
            {title}
          </p>
          <p className="mt-1 font-sans text-[14px] leading-6 text-ink">{children}</p>
        </div>
      </div>
    </div>
  );
}
