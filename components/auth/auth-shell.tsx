import Link from "next/link";
import type { ReactNode } from "react";

import { ShiftBoard } from "@/components/auth/shift-board";
import { Logo } from "@/components/ui/logo";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-[100dvh] bg-paper">
      <div className="mx-auto grid min-h-[100dvh] w-full max-w-[1180px] lg:grid-cols-[minmax(0,1fr)_minmax(0,438px)] lg:items-center">
        <aside className="order-2 flex flex-col gap-8 px-5 py-8 sm:px-8 lg:order-1 lg:justify-between lg:gap-0 lg:px-12 lg:py-9">
          <div className="hidden lg:block">
            <Logo />
          </div>

          <div className="lg:pb-2">
            <p className="max-w-[22ch] text-[22px] font-semibold leading-[1.15] tracking-[-0.02em] text-ink">
              One desk for the bench, the parts and the till.
            </p>
            <p className="mt-3 max-w-[38ch] text-[14px] leading-6 text-muted">
              Patchwork runs intake, repair tickets, parts, invoices and customer updates from a
              single queue.
            </p>

            <div className="mt-8">
              <ShiftBoard />
            </div>

            <p className="mt-8 max-w-[34ch] text-[13px] leading-5 text-muted">
              <span className="text-ink">Every ticket moves five ways.</span> Intake, diagnosis,
              repair, QA, ready.
            </p>
          </div>

          <div className="hidden items-center gap-5 text-[13px] text-muted lg:flex">
            <p>Patchwork · Repair operations</p>
            <Link href="/track" className="transition-colors hover:text-ink">
              Public tracker
            </Link>
          </div>
        </aside>

        <div className="order-1 flex min-h-0 flex-col lg:order-2 lg:my-2 lg:mr-2 lg:self-center lg:rounded lg:bg-raised">
          <header className="flex items-center justify-between px-5 pt-5 sm:px-8 lg:hidden">
            <Logo />
            <Link href="/track" className="text-[13px] text-muted transition-colors hover:text-ink">
              Track a repair
            </Link>
          </header>

          <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:py-6">{children}</div>

          <footer className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-b-lg bg-raised px-5 py-3.5 text-[13px] text-muted sm:px-8">
            <p>Staff accounts are invite-only</p>
            <Link href="/status" className="transition-colors hover:text-ink">
              System status
            </Link>
          </footer>
        </div>
      </div>
    </main>
  );
}
