import Link from "next/link";
import type { ReactNode } from "react";

import { ShiftBoard } from "@/components/auth/shift-board";
import { DeviceStageMount } from "@/components/three/device-stage-mount";
import { Logo } from "@/components/ui/logo";

/**
 * The front door. The left plate is the bench: the device, taken apart, with the
 * shop's promise set under it. The right column is the docket you sign — the
 * form, and the two live checks that tell the desk the records are reachable
 * before a customer arrives.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-[100dvh] lg:grid-cols-[minmax(0,1fr)_minmax(392px,432px)]">
      <section className="relative flex flex-col px-5 pb-8 pt-6 sm:px-8 lg:px-12 lg:pb-10 lg:pt-9">
        <Logo />

        <div className="relative -mx-5 mt-4 flex min-h-[240px] flex-1 items-center sm:-mx-8 lg:mx-0 lg:mt-0">
          <DeviceStageMount
            status="in_repair"
            quality="high"
            className="h-[280px] w-full sm:h-[360px] lg:h-[440px]"
          />
        </div>

        <div className="mt-6 lg:mt-0">
          <h1 className="rise display max-w-[16ch] text-[clamp(38px,4.6vw,64px)] text-ink">
            Every repair, accounted for.
          </h1>
          <p
            className="rise mt-4 max-w-[40ch] font-sans text-[16px] leading-[1.6] text-ink-secondary"
            style={{ animationDelay: "80ms" }}
          >
            One desk for the intake, the parts, the bench and the till.
          </p>

          <div
            className="rise mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-hairline pt-4"
            style={{ animationDelay: "140ms" }}
          >
            <Link
              href="/track"
              className="font-sans text-[13px] font-medium text-ink transition-colors hover:text-accent-bright"
            >
              Track a repair
            </Link>
            <Link
              href="/status"
              className="font-sans text-[13px] text-ink-tertiary transition-colors hover:text-ink"
            >
              System status
            </Link>
          </div>
        </div>
      </section>

      <section className="flex flex-col border-t border-hairline bg-panel lg:border-l lg:border-t-0">
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
