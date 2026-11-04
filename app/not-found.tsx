import Link from "next/link";
import type { Metadata } from "next";

import { ArchiveStrip } from "@/components/patchwork/archive-strip";
import { TeardownPlate } from "@/components/patchwork/teardown-plate";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main className="min-h-[100dvh] bg-sunken px-4 py-5 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-[1000px] flex-col">
        <Logo tone="night" />

        <div className="grid flex-1 items-center gap-8 py-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="figure text-[13px] text-accent-bright">404</p>
            <h1 className="rise display mt-3 max-w-[14ch] text-[clamp(38px,5vw,64px)] text-ink">
              This page is not on the bench.
            </h1>
            <p
              className="rise mt-4 max-w-[46ch] font-sans text-[16px] leading-7 text-ink-secondary"
              style={{ animationDelay: "80ms" }}
            >
              The link may be old, or the page moved. Head back to the desk and pick up from the
              queue.
            </p>
            <div className="rise mt-6 flex flex-wrap gap-2" style={{ animationDelay: "150ms" }}>
              <Link
                href="/"
                className="inline-flex h-11 items-center rounded-sm bg-accent px-4 font-sans text-[14px] font-semibold text-white transition-colors hover:bg-accent-deep"
              >
                Back to the desk
              </Link>
              <Link
                href="/track"
                className="inline-flex h-11 items-center rounded-sm bg-overlay px-4 font-sans text-[14px] font-semibold text-ink transition-colors hover:bg-overlay"
              >
                Track a repair
              </Link>
            </div>
          </div>

          <div className="rise hidden h-[340px] w-full lg:block" aria-hidden="true">
            <TeardownPlate />
          </div>
        </div>

        <ArchiveStrip className="rise mt-8" height="h-[76px] lg:h-[96px]" />

        <p className="rise mt-6 font-sans text-[13px] text-ink-secondary">
          Patchwork · Repair operations
        </p>
      </div>
    </main>
  );
}
