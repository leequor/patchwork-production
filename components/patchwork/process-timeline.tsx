import { BadgeCheck, ClipboardList, ScanLine, Wrench } from "lucide-react";

import { cn } from "@/lib/utils";

const PROCESS = [
  { label: "Intake", icon: ClipboardList },
  { label: "Diagnosing", icon: ScanLine },
  { label: "In repair", icon: Wrench },
  { label: "Ready", icon: BadgeCheck },
] as const;

/** The four beats a customer actually needs to picture. */
export function ProcessTimeline({ className }: { className?: string }) {
  return (
    <ol
      aria-label="How a repair moves through the shop"
      className={cn("rise relative mt-14 grid grid-cols-4 sm:mt-20", className)}
      style={{ animationDelay: "240ms" }}
    >
      <span
        aria-hidden="true"
        className="absolute left-[12.5%] right-[12.5%] top-7 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
      />
      {PROCESS.map(({ label, icon: Icon }) => (
        <li key={label} className="relative flex flex-col items-center gap-3">
          <span className="relative grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_20px_44px_-26px_rgba(99,102,241,0.95)]">
            <span
              aria-hidden="true"
              className="absolute inset-2 rounded-xl bg-gradient-to-br from-accent/30 to-[#22d3ee]/20 blur-xl"
            />
            <Icon className="relative h-5 w-5 text-white" strokeWidth={1.6} />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-secondary sm:text-[11px] sm:tracking-[0.24em]">
            {label}
          </span>
        </li>
      ))}
    </ol>
  );
}
