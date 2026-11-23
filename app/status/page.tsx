import type { Metadata } from "next";

import { StatusPanel } from "@/components/landing/status-panel";
import { SiteFooter, SiteHeader } from "@/components/patchwork/site-frame";

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
    <main className="min-h-[100dvh]">
      <div className="mx-auto w-full max-w-[1040px] px-5 pb-10 sm:px-8">
        <SiteHeader className="pt-6 sm:pt-8" back={{ href: "/track", label: "Back" }}
          action={{ href: "/", label: "Back to desk" }} />

        <section className="pt-14 sm:pt-20">
          <h1 className="rise display max-w-[18ch] text-[clamp(40px,6vw,72px)] text-ink">
            Is the shop open?
          </h1>
          <p
            className="rise mt-5 max-w-[54ch] font-sans text-[17px] leading-[1.55] text-ink-secondary"
            style={{ animationDelay: "70ms" }}
          >
            Two checks, run on demand and never cached: the app itself, and the records service
            behind it.
          </p>
        </section>

        <section
          aria-label="Health checks"
          className="rise mt-10 rounded-md bg-panel p-5 sm:p-7"
          style={{ animationDelay: "130ms" }}
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-hairline pb-3">
            <h2 className="font-sans text-[13px] font-medium text-ink">Live checks</h2>
            <p className="font-mono text-2xs uppercase tracking-[0.16em] text-ink-faint">
              Never cached
            </p>
          </div>
          <StatusPanel />
        </section>

        <section className="mt-12">
          <h2 className="rise display-tight text-[24px] text-ink">If a check fails</h2>
          <ol className="mt-4 border-t border-hairline">
            {RUNBOOK.map((item, index) => (
              <li
                key={item.title}
                className="grid grid-cols-[minmax(0,26px)_minmax(0,220px)_minmax(0,1fr)] items-baseline gap-4 border-b border-hairline py-4"
              >
                <span className="figure text-[13px] text-ink-faint">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="font-sans text-[15px] font-medium text-ink">{item.title}</p>
                <p className="font-sans text-[14px] leading-6 text-ink-secondary">{item.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <p className="mt-6 font-sans text-[13px] text-ink-tertiary">
          Work top to bottom. Health checks run on demand and are never cached.
        </p>

        <SiteFooter className="mt-12" />
      </div>
    </main>
  );
}
