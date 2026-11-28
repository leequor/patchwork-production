import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

import { ShiftBoard } from "@/components/auth/shift-board";
import { RepairTree } from "@/components/landing/repair-tree";
import { ReactiveGrid } from "@/components/patchwork/reactive-grid";
import { Logo } from "@/components/ui/logo";

/**
 * The front door, with the shop's garden on it.
 *
 * The left plate is the same blossom footage the public tracker opens with, at
 * full bleed: the front door and the shopfront should be the same building. The
 * right column is the docket you sign — the form, and the two live checks that
 * tell the desk the records are reachable before a customer arrives.
 *
 * Scrims, each with one job: a top band so the logo never lands on a blossom, a
 * left wall so the headline has ground, and a floor that fades *out* so the art
 * dissolves into the form instead of ending on a line.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-[100dvh] content-start bg-canvas md:grid-cols-[minmax(0,1.4fr)_minmax(360px,1fr)] md:content-stretch">
      <section className="relative isolate flex flex-col overflow-hidden px-5 pb-6 pt-5 sm:px-8 md:justify-between md:pb-10 md:pt-8 lg:px-12 xl:px-16 xl:pb-14">
        <RepairTree
          className="absolute inset-0 -z-20 [filter:brightness(1.14)_saturate(1.05)]"
          controlPosition="bottom-5 right-5 sm:right-8 md:bottom-9 lg:right-12 xl:bottom-12 xl:right-16"
        />
        <ReactiveGrid className="pointer-events-none absolute inset-0 -z-10" />

        {/* Ground, not a blanket. The old plate was three full-width gradients,
            which is why the tree read as a texture instead of a tree: every
            pixel of it was dimmed. Now the darkness is a corner — where the
            words are — and everything above and to the right keeps its light. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(9,8,15,0.82)_0%,rgba(9,8,15,0.45)_12%,transparent_26%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(125%_92%_at_0%_100%,rgba(9,8,15,0.94)_0%,rgba(9,8,15,0.86)_34%,rgba(9,8,15,0.52)_58%,rgba(9,8,15,0.14)_80%,transparent_94%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[38%] bg-[linear-gradient(to_top,rgba(9,8,15,0.88)_0%,rgba(9,8,15,0.42)_34%,transparent_78%)]"
        />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <Logo />
          <Link href="/status" className="tap inline-flex min-h-10 items-center gap-1.5 text-sm text-ink-secondary hover:text-ink">
            System status <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </div>

        <div className="relative z-10 mt-auto pt-9 sm:pt-16 md:pt-32">
          <h1 className="rise display-hero max-w-[12ch] text-[clamp(40px,5.3vw,82px)] text-ink">
            Every repair, accounted for.
          </h1>
          <p
            className="rise mt-3 max-w-[36ch] text-[15px] leading-relaxed text-ink-secondary md:mt-5 md:text-[17px]"
            style={{ animationDelay: "80ms" }}
          >
            One desk for the intake, the parts, the bench and the till.
          </p>

          <div
            className="rise mt-3 flex items-center md:mt-6"
            style={{ animationDelay: "140ms" }}
          >
            <Link
              href="/track"
              className="tap group inline-flex min-h-11 items-center gap-2 text-sm font-medium text-ink underline decoration-accent-bright/70 underline-offset-[6px] hover:decoration-ink"
            >
              Track a repair <ArrowUpRight aria-hidden="true" size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="relative flex min-w-0 flex-col bg-canvas">
        {/* The seam is a fade, not a border: one line the eye can follow from
            the top of the page to the bottom of it. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,rgba(241,239,250,0.14),rgba(241,239,250,0.04)_60%,transparent)] lg:inset-y-0 lg:left-0 lg:right-auto lg:h-auto lg:w-px lg:bg-[linear-gradient(to_bottom,rgba(241,239,250,0.14),rgba(241,239,250,0.05)_55%,transparent)]"
        />

        <div className="flex flex-1 items-center justify-center px-4 py-5 sm:px-6 md:py-12 lg:px-10">
          <div className="w-full max-w-[420px]">
            <div className="rise overflow-hidden rounded-md bg-panel" style={{ animationDelay: "90ms" }}>
              <div className="claim-stub"><span>Repair desk</span><span>Staff copy</span></div>
              <div className="px-5 py-6 sm:px-7 sm:py-8">
                {children}
              </div>
            </div>
            <div className="rise mt-4" style={{ animationDelay: "150ms" }}>
              <ShiftBoard />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
