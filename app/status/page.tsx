import type { Metadata } from "next";
import Link from "next/link";

import { StatusPanel } from "@/components/landing/status-panel";
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
    <main className="flex min-h-[100dvh] flex-col bg-paper">
      <header className="bg-surface">
        <div className="mx-auto flex h-14 max-w-[1000px] items-center justify-between px-5 sm:px-6">
          <Logo />
          <Link
            href="/"
            className="inline-flex h-8 items-center rounded px-2.5 text-[13px] text-muted transition-colors hover:bg-wash hover:text-ink"
          >
            Back to desk
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1000px] flex-1 px-5 pb-16 pt-8 sm:px-6 sm:pt-10">
        <h1 className="text-[24px] font-semibold leading-tight tracking-[-0.02em] text-ink">
          System status
        </h1>
        <p className="mt-1.5 max-w-[58ch] text-[13.5px] leading-6 text-muted">
          Two checks, run on demand and never cached: the Next.js app and the configured Supabase
          project.
        </p>

        <div className="mt-6 rounded bg-surface px-5 py-5">
          <StatusPanel />
        </div>

        <section className="mt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-[14px] font-semibold text-ink">If a check fails</h2>
            <p className="text-[12.5px] text-muted">Work top to bottom.</p>
          </div>
          <ol className="mt-3 space-y-2">
            {RUNBOOK.map((item, index) => (
              <li key={item.title} className="rounded bg-surface px-4 py-3">
                <div className="flex items-baseline gap-2">
                  <span className="figure text-[12px] text-accent">
                    {index + 1}
                  </span>
                  <p className="text-[13px] font-medium text-ink">{item.title}</p>
                </div>
                <p className="mt-1 max-w-[78ch] text-[13px] leading-5 text-muted">{item.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <p className="mt-8 text-[12.5px] text-muted">
          Health checks run on demand and are never cached.
        </p>
      </div>
    </main>
  );
}
