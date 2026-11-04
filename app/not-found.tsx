import Link from "next/link";
import type { Metadata } from "next";

import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main className="min-h-[100dvh] bg-paper px-5 py-5 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-[1000px] flex-col">
        <Logo />

        <div className="flex flex-1 flex-col justify-center py-12">
          <p className="figure text-[13px] text-accent">404</p>
          <h1 className="mt-2 max-w-[18ch] text-[32px] font-semibold leading-[1.05] tracking-[-0.03em] text-ink sm:text-[40px]">
            This page is off the bench.
          </h1>
          <p className="mt-3 max-w-[46ch] text-[13.5px] leading-6 text-muted">
            The link may be old, or the page moved. Head back to the desk and pick up from the
            queue.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/"
              className="inline-flex h-9 items-center rounded bg-accent px-4 text-[13px] font-semibold text-paper transition-colors hover:bg-gold"
            >
              Back to the desk
            </Link>
            <Link
              href="/track"
              className="inline-flex h-9 items-center rounded bg-wash px-3.5 text-[13px] text-ink transition-colors hover:bg-line"
            >
              Track a repair
            </Link>
          </div>
        </div>

        <p className="text-[12.5px] text-muted">Patchwork · Repair operations</p>
      </div>
    </main>
  );
}
