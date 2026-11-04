import Link from "next/link";
import type { ReactNode } from "react";

import { ShiftBoard } from "@/components/auth/shift-board";
import { TeardownPlate } from "@/components/patchwork/teardown-plate";
import { Logo } from "@/components/ui/logo";

const STAGES = ["Intake", "Diagnosis", "Parts", "Repair", "Ready"];

/**
 * One printed sheet. The ink field carries the name, the drawing and the
 * headline set as large as the plate allows — with the second line printed
 * out of register, the way a two-ink poster actually comes off the press.
 * The sign-in form is not a panel bolted on: it is the cream docket down the
 * right edge, with the live shop health as its tear-off stub.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-[100dvh] bg-sunken p-2">
      <div className="mx-auto grid min-h-[calc(100dvh-1rem)] w-full max-w-[1680px] gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(360px,400px)]">
        <section className="relative flex flex-col overflow-hidden rounded-sm bg-panel px-5 pb-6 pt-5 sm:px-8 lg:px-10 lg:pb-8">
          <Logo tone="night" />

          <div className="pointer-events-none absolute right-[-14%] top-[3%] hidden h-[58%] w-[68%] lg:block">
            <TeardownPlate className="plate-reveal" />
          </div>

          <div className="relative z-10 mt-auto max-w-full pt-12 lg:max-w-[70%]">
            <h1 className="rise display text-[clamp(40px,5.4vw,88px)] text-ink">
              <span className="block">Every repair,</span>
              <span className="relative block">
                <span aria-hidden="true" className="absolute left-[2px] top-[2px] block text-accent">
                  accounted for.
                </span>
                <span className="relative block">accounted for.</span>
              </span>
            </h1>
            <p
              className="rise mt-5 max-w-[36ch] font-sans text-[17px] leading-[1.55] text-ink-secondary"
              style={{ animationDelay: "80ms" }}
            >
              One desk for the intake, the parts, the bench and the till.
            </p>
          </div>

          <div
            className="rise relative z-10 mt-9 hidden flex-wrap items-center gap-x-5 gap-y-3 sm:flex"
            style={{ animationDelay: "150ms" }}
          >
            <ol className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Repair stages">
              {STAGES.map((stage, index) => (
                <li key={stage} className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={
                      index === STAGES.length - 1
                        ? "h-[3px] w-5 bg-accent"
                        : "h-[3px] w-5 bg-overlay"
                    }
                  />
                  <span className="font-sans text-[13px] text-ink-secondary">{stage}</span>
                </li>
              ))}
            </ol>
            <div className="ml-auto hidden gap-5 font-sans text-[13px] lg:flex">
              <Link href="/track" className="text-ink-secondary transition-colors hover:text-ink">
                Track a repair
              </Link>
              <Link href="/status" className="text-ink-secondary transition-colors hover:text-ink">
                Status
              </Link>
            </div>
          </div>
        </section>

        <section className="flex flex-col rounded-sm bg-canvas">
          <div className="rise flex flex-1 flex-col justify-center px-5 py-7 sm:px-8 sm:py-9" style={{ animationDelay: "90ms" }}>
            {children}
          </div>

          <div className="mt-auto border-t border-dashed border-hairline">
            <ShiftBoard />
          </div>
        </section>
      </div>
    </main>
  );
}
