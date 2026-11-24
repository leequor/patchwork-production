import Link from "next/link";
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
    <main className="grid min-h-[100dvh] lg:grid-cols-[minmax(0,1fr)_minmax(392px,432px)]">
      <section className="relative isolate flex min-h-[66svh] flex-col overflow-hidden px-5 pb-8 pt-6 sm:px-8 lg:min-h-0 lg:px-12 lg:pb-10 lg:pt-9">
        <RepairTree className="absolute inset-0 -z-20" />
        <ReactiveGrid className="pointer-events-none absolute inset-0 -z-10" />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(9,8,15,0.9)_0%,rgba(9,8,15,0.55)_14%,transparent_30%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(9,8,15,0.92)_0%,rgba(9,8,15,0.78)_38%,rgba(9,8,15,0.32)_72%,transparent_100%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(9,8,15,0.94)_0%,rgba(9,8,15,0.7)_26%,rgba(9,8,15,0.24)_52%,transparent_76%)]"
        />

        <div className="relative z-10">
          <Logo />
        </div>

        <div className="relative z-10 mt-auto pt-16">
          <h1 className="rise display max-w-[15ch] text-[clamp(38px,4.6vw,64px)] text-ink">
            Every repair, accounted for.
          </h1>
          <p
            className="rise mt-4 max-w-[36ch] font-sans text-[16px] leading-[1.6] text-ink-secondary"
            style={{ animationDelay: "80ms" }}
          >
            One desk for the intake, the parts, the bench and the till.
          </p>

          <div
            className="rise mt-7 flex flex-wrap items-center gap-x-6 gap-y-2"
            style={{ animationDelay: "140ms" }}
          >
            <Link
              href="/track"
              className="tap font-sans text-[13px] font-medium text-ink transition-colors hover:text-accent-bright"
            >
              Track a repair
            </Link>
            <span aria-hidden="true" className="h-3 w-px bg-white/12" />
            <Link
              href="/status"
              className="tap font-sans text-[13px] text-ink-tertiary transition-colors hover:text-ink"
            >
              System status
            </Link>
          </div>
        </div>
      </section>

      <section className="relative flex flex-col bg-panel">
        {/* The seam is a fade, not a border: one line the eye can follow from
            the top of the page to the bottom of it. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,rgba(241,239,250,0.14),rgba(241,239,250,0.04)_60%,transparent)] lg:inset-y-0 lg:left-0 lg:right-auto lg:h-auto lg:w-px lg:bg-[linear-gradient(to_bottom,rgba(241,239,250,0.14),rgba(241,239,250,0.05)_55%,transparent)]"
        />

        <div className="flex flex-1 items-center justify-center px-5 py-9 sm:px-9 sm:py-12">
          <div className="w-full max-w-[352px]">
            <div className="rise" style={{ animationDelay: "90ms" }}>
              {children}
            </div>
            <div className="rise mt-8" style={{ animationDelay: "150ms" }}>
              <ShiftBoard />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
