import { TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

/** A system alert that reads like a bench readout, not a browser popup. */
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
      className="flex items-start gap-3 rounded-sm border border-negative/30 bg-negative-soft px-4 py-3.5"
    >
      <TriangleAlert
        aria-hidden="true"
        className="mt-0.5 h-4 w-4 shrink-0 text-negative"
        strokeWidth={1.8}
      />
      <div className="min-w-0">
        <p className="font-sans text-[13px] font-semibold text-negative-ink">{title}</p>
        <p className="mt-1 font-sans text-[14px] leading-6 text-ink">{children}</p>
      </div>
    </div>
  );
}
