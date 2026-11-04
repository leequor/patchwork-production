import type { Metadata } from "next";
import Link from "next/link";

import { StatusPanel } from "@/components/landing/status-panel";
import { CursorSpotlight } from "@/components/patchwork/cursor-spotlight";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "System status",
};

const RUNBOOK = [
  {
    title: "The app is unreachable",
    body: "Check the deployment is live and that /api/health returns 200, then run the checks again.",
  },
  {
    title: "Supabase is unavailable",
    body: "Confirm the project URL and anon key on the deployment, then re-run the check.",
  },
  {
    title: "Before service",
    body: "Open this page on the front-desk machine so both checks are warm before customers arrive.",
  },
];

export default function StatusPage() {
  return (
    <main className="relative min-h-[100dvh] overflow-x-clip bg-canvas">
      <CursorSpotlight />

      <div className="relative z-10">
        <section className="px-4 pb-10 pt-5 sm:px-6 sm:pb-12">
          <div className="mx-auto w-full max-w-[1000px]">
            <header className="flex items-center justify-between gap-4">
              <Logo tone="night" />
              <Link
                href="/"
                className="inline-flex h-10 items-center rounded-lg border border-white/10 bg-white/[0.06] px-3.5 font-sans text-[13px] text-ink-secondary backdrop-blur-md transition-colors hover:bg-white/[0.12] hover:text-ink"
              >
                Back to desk
              </Link>
            </header>

            <p className="rise mt-14 font-mono text-[10px] uppercase tracking-[0.32em] text-ink-secondary/80 sm:mt-20">
              System status
            </p>
            <h1 className="rise display mt-4 max-w-[16ch] text-6xl leading-[0.94] tracking-[-0.045em] text-balance sm:text-7xl">
              <span className="bg-gradient-to-b from-white via-white to-ink-secondary bg-clip-text text-transparent">
                Is the shop open?
              </span>
            </h1>
            <p
              className="rise mt-5 max-w-[54ch] font-sans text-[17px] leading-[1.55] text-ink-secondary"
              style={{ animationDelay: "80ms" }}
            >
              Two checks, run on demand and never cached: the app itself and the records service
              behind it.
            </p>
          </div>
        </section>

        <div className="mx-auto w-full max-w-[1000px] px-4 pb-16 sm:px-6">
          <section
            aria-label="Health checks"
            className="rise edge-lit rounded-2xl bg-panel/40 p-5 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.9)] backdrop-blur-2xl sm:p-6"
            style={{ animationDelay: "160ms" }}
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink-secondary">
                Live checks
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-secondary/70">
                Never cached
              </p>
            </div>
            <StatusPanel />
          </section>

          <section className="mt-10">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="rise display text-[24px] text-ink">If a check fails</h2>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-secondary">
                Work top to bottom
              </p>
            </div>
            <ol className="mt-3 grid gap-2 md:grid-cols-3">
              {RUNBOOK.map((item, index) => (
                <li
                  key={item.title}
                  className="rise edge-lit rounded-xl bg-panel/40 px-4 py-4 backdrop-blur-md"
                  style={{ animationDelay: `${80 + index * 70}ms` }}
                >
                  <span
                    className="block h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_rgba(99,102,241,0.8)]"
                    aria-hidden="true"
                  />
                  <p className="mt-2 font-sans text-[15px] font-semibold text-ink">{item.title}</p>
                  <p className="mt-1.5 max-w-[46ch] font-sans text-[15px] leading-6 text-ink-secondary">
                    {item.body}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-secondary/70">
            Health checks run on demand and are never cached.
          </p>
        </div>
      </div>
    </main>
  );
}
