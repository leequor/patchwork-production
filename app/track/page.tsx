import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { CursorSpotlight } from "@/components/patchwork/cursor-spotlight";
import { ProcessTimeline } from "@/components/patchwork/process-timeline";
import { SystemAlert } from "@/components/patchwork/system-alert";
import { Logo } from "@/components/ui/logo";
import { RelativeTime } from "@/components/ui/relative-time";
import { Panel, StatusPill } from "@/components/workspace/ui";
import {
  DEVICE_CATEGORY_LABELS,
  formatDate,
  TICKET_STATUS_META,
} from "@/lib/repair/format";
import { getTrackedTicket } from "@/lib/repair/queries";
import type { TicketStatus } from "@/lib/repair/types";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Track your repair",
  description: "Check repair progress with the tracking code from your intake receipt.",
};

type SearchParams = Promise<{ code?: string; error?: string }>;

/** The stages a repair passes through, in shop order. */
const RAIL: TicketStatus[] = ["intake", "diagnosing", "waiting_parts", "in_repair", "ready"];

function railIndex(status: TicketStatus) {
  return RAIL.indexOf(status);
}

export default async function TrackPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const code = params.code?.trim() ?? "";
  const hasQuery = Boolean(code);
  const ticket = hasQuery ? await getTrackedTicket(code) : null;
  const current = ticket ? railIndex(ticket.status) : -1;
  const closed = ticket ? ["picked_up", "cancelled"].includes(ticket.status) : false;

  return (
    <main className="relative min-h-[100dvh] overflow-x-clip bg-canvas">
      <CursorSpotlight />

      <div className="relative z-10">
        <section className="px-4 pb-12 pt-5 sm:px-6 sm:pb-16">
          <div className="mx-auto w-full max-w-[1100px]">
            <header className="flex items-center justify-between gap-4">
              <Logo href="/" tone="night" />
              <div className="flex items-center gap-5">
                <Link
                  href="/status"
                  className="hidden font-sans text-[13px] text-ink-secondary transition-colors hover:text-ink sm:block"
                >
                  System status
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-10 items-center rounded-lg border border-white/10 bg-white/[0.06] px-3.5 font-sans text-[13px] font-semibold text-ink backdrop-blur-md transition-colors hover:bg-white/[0.12]"
                >
                  Staff sign in
                </Link>
              </div>
            </header>

            <div className="mt-14 grid items-end gap-10 sm:mt-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
              <div className="max-w-[38rem]">
                <p className="rise font-mono text-[10px] uppercase tracking-[0.32em] text-ink-secondary/80">
                  Repair tracking
                </p>
                <h1 className="rise display mt-4 text-6xl leading-[0.94] tracking-[-0.045em] text-balance sm:text-7xl">
                  <span className="bg-gradient-to-b from-white via-white to-ink-secondary bg-clip-text text-transparent">
                    Where is my repair?
                  </span>
                </h1>
                <p
                  className="rise mt-5 max-w-[46ch] font-sans text-[17px] leading-[1.55] text-ink-secondary"
                  style={{ animationDelay: "80ms" }}
                >
                  Type the ten-character code from your intake receipt. No account, email or phone
                  number needed.
                </p>
              </div>

              <form
                className="rise edge-lit w-full rounded-2xl bg-panel/40 p-5 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.9)] backdrop-blur-2xl sm:p-6 lg:justify-self-end"
                method="get"
                action="/track"
                style={{ animationDelay: "160ms" }}
              >
                <label
                  htmlFor="code"
                  className="block text-center font-mono text-[10px] uppercase tracking-[0.3em] text-ink-secondary"
                >
                  Tracking code
                </label>
                <input
                  id="code"
                  name="code"
                  defaultValue={code}
                  placeholder="TRACK10041"
                  aria-describedby="tracking-code-help"
                  autoComplete="off"
                  spellCheck={false}
                  className="mt-3 h-14 w-full rounded-xl border border-white/10 bg-black/35 px-3 text-center font-mono text-[19px] uppercase tracking-[0.3em] text-ink caret-accent outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-ink-secondary/30 focus:border-accent/60 focus:shadow-[0_0_0_1px_rgba(99,102,241,0.4),0_0_36px_-10px_rgba(99,102,241,0.65)]"
                  required
                />
                <button
                  type="submit"
                  className="group mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent font-sans text-[15px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_18px_44px_-20px_rgba(99,102,241,0.9)] transition-[background-color,transform,box-shadow] duration-150 hover:bg-accent-deep active:scale-95 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                >
                  Check status
                  <ArrowRight
                    aria-hidden="true"
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    strokeWidth={2}
                  />
                </button>
                <p
                  id="tracking-code-help"
                  className="mt-3 text-center font-sans text-[12px] leading-5 text-ink-secondary"
                >
                  Printed on the receipt next to the PW- ticket number. It is not the ticket number
                  itself.
                </p>
              </form>
            </div>

            <ProcessTimeline />
          </div>
        </section>

        <div className="mx-auto w-full max-w-[1100px] px-4 pb-16 sm:px-6">
          {params.error || (hasQuery && !ticket) ? (
            <SystemAlert title={params.error ? "Error: request failed" : "Error: code not found"}>
              {params.error ||
                "No ticket matched that code. Check the ten characters on the receipt."}
            </SystemAlert>
          ) : !hasQuery ? (
            <div className="edge-lit rounded-xl bg-panel/40 px-5 py-4 backdrop-blur-xl">
              <p className="font-sans text-[14px] leading-6 text-ink-secondary">
                The shop updates this page as the job moves. Bookmark it and come back when you
                want to look.
              </p>
            </div>
          ) : null}

          {ticket ? (
            <div className="mt-3 grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
              <Panel className="p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="figure text-[13px] text-ink-secondary">{ticket.ticket_number}</p>
                    <h2 className="display mt-1.5 text-[26px] text-ink">
                      {ticket.device.brand} {ticket.device.model}
                    </h2>
                  </div>
                  <StatusPill status={ticket.status} />
                </div>

                <p className="mt-2 font-sans text-[14px] text-ink-secondary">
                  {DEVICE_CATEGORY_LABELS[ticket.device.category] ?? ticket.device.category} ·
                  opened {formatDate(ticket.created_at)} · updated{" "}
                  <RelativeTime value={ticket.updated_at} />
                </p>

                <div className="mt-6">
                  <p className="font-sans text-[13px] font-semibold text-ink">Progress</p>
                  <ol aria-label="Repair stages" className="mt-2 grid grid-cols-5 gap-1.5">
                    {RAIL.map((status, index) => {
                      const reached = !closed && current >= index;
                      const blocked = status === "waiting_parts" && current === 2;
                      return (
                        <li key={status}>
                          <span
                            className={cn(
                              "block h-[5px]",
                              blocked ? "bg-warn" : reached ? "bg-accent" : "bg-overlay",
                            )}
                            aria-hidden="true"
                          />
                          <span
                            className={cn(
                              "mt-2 block font-sans text-[13px] leading-4",
                              reached ? "text-ink" : "text-ink-secondary",
                            )}
                          >
                            {TICKET_STATUS_META[status].label}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                  {closed ? (
                    <p className="mt-3 font-sans text-[14px] text-ink-secondary">
                      This repair is closed. Call the shop if you need it reopened.
                    </p>
                  ) : null}
                </div>

                <div className="mt-6 rounded-xl bg-canvas/80 px-4 py-3.5">
                  <p className="font-sans text-[13px] text-ink-secondary">What we are working on</p>
                  <p className="mt-1.5 font-sans text-[15px] leading-6 text-ink">{ticket.issue}</p>
                </div>

                <p className="mt-3 font-sans text-[14px] leading-6 text-ink-secondary">
                  Current stage: {TICKET_STATUS_META[ticket.status].label}.{" "}
                  {TICKET_STATUS_META[ticket.status].description}
                </p>
              </Panel>

              <Panel className="p-5 sm:p-6">
                <h2 className="font-sans text-[15px] font-semibold text-ink">Timeline</h2>
                <p className="mt-0.5 font-sans text-[13px] text-ink-secondary">
                  Updates the bench shared with you.
                </p>
                {ticket.events.length === 0 ? (
                  <p className="mt-4 font-sans text-[14px] text-ink-secondary">No updates yet.</p>
                ) : (
                  <ol className="mt-5 space-y-4">
                    {ticket.events.map((event, index) => (
                      <li key={`${event.created_at}-${index}`} className="flex gap-3">
                        <span className="mt-2 h-2 w-2 shrink-0 bg-accent" aria-hidden="true" />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            {event.status ? <StatusPill status={event.status} /> : null}
                            <RelativeTime
                              value={event.created_at}
                              className="font-sans text-[13px] text-ink-secondary"
                            />
                          </div>
                          {event.body ? (
                            <p className="mt-1 font-sans text-[14px] leading-6 text-ink-secondary">
                              {event.body}
                            </p>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
                <p className="mt-6 border-t border-hairline pt-4 font-sans text-[13px] leading-5 text-ink-secondary">
                  Hi {ticket.customer_name}. If something looks wrong, call the shop and quote{" "}
                  <span className="figure text-ink">{ticket.ticket_number}</span>.
                </p>
              </Panel>
            </div>
          ) : (
            <div className="mt-8">
              <h2 className="rise display text-[24px] text-ink">What the stages mean</h2>
              <ol className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {[...RAIL, "picked_up"].map((status, index) => (
                  <li
                    key={status}
                    className="rise edge-lit rounded-xl bg-panel/40 px-4 py-4 backdrop-blur-md"
                    style={{ animationDelay: `${80 + index * 60}ms` }}
                  >
                    <StatusPill status={status as TicketStatus} />
                    <p className="mt-2 font-sans text-[14px] leading-6 text-ink-secondary">
                      {TICKET_STATUS_META[status as TicketStatus].description}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        <footer className="px-4 py-8 sm:px-6">
          <div className="mx-auto flex w-full max-w-[1100px] flex-wrap items-center justify-between gap-2 font-sans text-[13px] text-ink-secondary">
            <p>Patchwork · Repair operations</p>
            <p>Customers see status only. Staff manage the rest.</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
