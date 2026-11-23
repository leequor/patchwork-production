import Link from "next/link";
import type { Metadata } from "next";

import { SiteFooter, SiteHeader } from "@/components/patchwork/site-frame";
import { DeviceStageMount } from "@/components/three/device-stage-mount";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main className="min-h-[100dvh]">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[1040px] flex-col px-5 pb-10 sm:px-8">
        <SiteHeader className="pt-6 sm:pt-8" action={{ href: "/", label: "Back to desk" }} />

        <div className="grid flex-1 items-center gap-8 py-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <h1 className="rise display max-w-[16ch] text-[clamp(36px,4.6vw,58px)] text-ink">
              This page is not in the queue.
            </h1>
            <p
              className="rise mt-5 max-w-[46ch] font-sans text-[16px] leading-7 text-ink-secondary"
              style={{ animationDelay: "70ms" }}
            >
              <span className="figure text-accent">404</span> — the link may be old, or the page
              moved. Head back to the desk, or track a repair if you came in from a receipt.
            </p>
            <div className="rise mt-7 flex flex-wrap gap-2" style={{ animationDelay: "130ms" }}>
              <Link
                href="/"
                className="brass inline-flex h-10 items-center rounded-sm px-4 font-sans text-[14px] font-semibold transition-[filter] hover:brightness-105"
              >
                Back to the desk
              </Link>
              <Link
                href="/track"
                className="inline-flex h-10 items-center rounded-sm border border-hairline-strong bg-raised px-4 font-sans text-[14px] font-medium text-ink transition-colors hover:border-ink-faint hover:bg-overlay"
              >
                Track a repair
              </Link>
            </div>
          </div>

          <div className="hidden h-[380px] w-full lg:block">
            <DeviceStageMount status="picked_up" quality="low" className="h-full w-full" />
          </div>
        </div>

        <SiteFooter />
      </div>
    </main>
  );
}
