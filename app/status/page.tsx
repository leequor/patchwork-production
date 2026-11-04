import type { Metadata } from "next";
import Link from "next/link";

import { StatusPanel } from "@/components/landing/status-panel";
import { ArchiveStrip } from "@/components/patchwork/archive-strip";
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
    <main className="min-h-[100dvh] bg-paper">
      <section className="bg-night px-4 pb-10 pt-5 sm:px-6 sm:pb-12">
        <div className="mx-auto w-full max-w-[1000px]">
          <header className="flex items-center justify-between gap-4">
            <Logo tone="night" />
            <Link
              href="/"
              className="font-sans text-[13px] text-creamMuted transition-colors hover:text-cream"
            >
              Back to desk
            </Link>
          </header>

          <h1 className="rise display mt-12 max-w-[16ch] text-[clamp(38px,5.6vw,76px)] text-cream sm:mt-16">
            Is the shop open?
          </h1>
          <p
            className="rise mt-4 max-w-[54ch] font-serif text-[17px] leading-[1.55] text-creamMuted"
            style={{ animationDelay: "80ms" }}
          >
            Two checks, run on demand and never cached: the app itself and the records service
            behind it.
          </p>

          <ArchiveStrip className="mt-10" />
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1000px] px-4 pb-16 pt-6 sm:px-6">
        <div className="rise rounded-sm bg-surface px-5 py-5">
          <StatusPanel />
        </div>

        <section className="mt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="rise display text-[24px] text-ink">If a check fails</h2>
            <p className="font-sans text-[13px] text-muted">Work top to bottom.</p>
          </div>
          <ol className="mt-3 grid gap-2 md:grid-cols-3">
            {RUNBOOK.map((item, index) => (
              <li
                key={item.title}
                className="rise rounded-sm bg-surface px-4 py-4"
                style={{ animationDelay: `${80 + index * 70}ms` }}
              >
                <span className="block h-1.5 w-1.5 bg-accent" aria-hidden="true" />
                <p className="mt-2 font-sans text-[15px] font-semibold text-ink">{item.title}</p>
                <p className="mt-1.5 max-w-[46ch] font-serif text-[15px] leading-6 text-muted">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <p className="mt-8 font-serif text-[13px] leading-5 text-muted">
          Health checks run on demand and are never cached.
        </p>
      </div>
    </main>
  );
}
