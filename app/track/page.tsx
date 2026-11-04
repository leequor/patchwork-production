import Link from "next/link";
import type { Metadata } from "next";

import { Logo } from "@/components/ui/logo";
import { Feedback, Panel, StatusPill } from "@/components/workspace/ui";
import {
  DEVICE_CATEGORY_LABELS,
  formatDate,
  formatRelative,
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
    <main className="flex min-h-[100dvh] flex-col bg-paper">
      <header className="bg-surface">
        <div className="mx-auto flex h-14 max-w-[1000px] items-center justify-between px-5 sm:px-6">
          <Logo href="/" />
          <div className="flex items-center gap-2">
            <Link
              href="/status"
              className="hidden h-8 items-center rounded px-2.5 text-[13px] text-muted transition-colors hover:bg-wash hover:text-ink sm:inline-flex"
            >
              System status
            </Link>
            <Link
              href="/login"
              className="inline-flex h-8 items-center rounded bg-wash px-3 text-[13px] font-medium text-ink transition-colors hover:bg-line"
            >
              Staff sign in
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1000px] flex-1 px-5 pb-16 pt-8 sm:px-6 sm:pt-12">
        <h1 className="text-[24px] font-semibold leading-tight tracking-[-0.02em] text-ink">
          Track your repair
        </h1>
        <p className="mt-1.5 max-w-[52ch] text-[13.5px] leading-6 text-muted">
          Enter the ten-character code from your intake receipt. No account, email or phone number
          needed.
        </p>

        <form className="mt-6 flex flex-wrap items-end gap-2" method="get">
          <label className="min-w-[240px] flex-1">
            <span className="mb-1.5 block text-[13px] font-medium text-ink">Tracking code</span>
            <input
              name="code"
              defaultValue={code}
              placeholder="TRACK10041"
              aria-describedby="tracking-code-help"
              className="h-9 w-full rounded border border-line bg-surface px-2.5 font-mono text-[13px] uppercase tracking-[0.04em] text-ink outline-none placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-muted/60 focus:border-accent"
              required
            />
          </label>
          <button
            type="submit"
            className="inline-flex h-9 items-center justify-center rounded bg-accent px-4 text-[13px] font-semibold text-paper transition-colors hover:bg-gold"
          >
            Check status
          </button>
        </form>
        <p id="tracking-code-help" className="mt-1.5 text-[12.5px] text-muted">
          Printed on the receipt next to the PW- ticket number. It is not the ticket number itself.
        </p>

        <Feedback
          error={
            params.error ||
            (hasQuery && !ticket
              ? "No ticket matched that code. Check the ten characters on the receipt."
              : undefined)
          }
        />

        {ticket ? (
          <div className="mt-8 grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
            <Panel className="px-5 py-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="figure text-[12.5px] text-muted">{ticket.ticket_number}</p>
                  <h2 className="mt-1 text-[19px] font-semibold tracking-[-0.015em] text-ink">
                    {ticket.device.brand} {ticket.device.model}
                  </h2>
                </div>
                <StatusPill status={ticket.status} />
              </div>

              <p className="mt-2 text-[12.5px] text-muted">
                {DEVICE_CATEGORY_LABELS[ticket.device.category] ?? ticket.device.category} · opened{" "}
                {formatDate(ticket.created_at)} · updated {formatRelative(ticket.updated_at)}
              </p>

              <div className="mt-5">
                <p className="text-[12px] text-muted">Progress</p>
                <ol aria-label="Repair stages" className="mt-2 grid grid-cols-5 gap-1.5">
                  {RAIL.map((status, index) => {
                    const reached = !closed && current >= index;
                    const blocked = status === "waiting_parts" && current === 2;
                    return (
                      <li key={status}>
                        <span
                          className={cn(
                            "block h-1 rounded-none",
                            blocked
                              ? "bg-warn"
                              : reached
                                ? "bg-accent"
                                : "bg-wash",
                          )}
                          aria-hidden="true"
                        />
                        <span
                          className={cn(
                            "mt-1.5 block text-[11.5px] leading-4",
                            reached ? "text-ink" : "text-muted",
                          )}
                        >
                          {TICKET_STATUS_META[status].label}
                        </span>
                      </li>
                    );
                  })}
                </ol>
                {closed ? (
                  <p className="mt-2 text-[12.5px] text-muted">
                    This repair is closed. Call the shop if you need it reopened.
                  </p>
                ) : null}
              </div>

              <div className="mt-5 rounded bg-paper px-3.5 py-3">
                <p className="text-[12px] text-muted">What we are working on</p>
                <p className="mt-1 text-[13px] leading-6 text-ink">{ticket.issue}</p>
              </div>

              <p className="mt-3 text-[12.5px] leading-5 text-muted">
                Current stage: {TICKET_STATUS_META[ticket.status].label}.{" "}
                {TICKET_STATUS_META[ticket.status].description}
              </p>
            </Panel>

            <Panel className="px-5 py-5">
              <h2 className="text-[14px] font-semibold text-ink">Timeline</h2>
              <p className="mt-0.5 text-[12.5px] text-muted">Updates the bench shared with you.</p>
              {ticket.events.length === 0 ? (
                <p className="mt-4 text-[13px] text-muted">No updates yet.</p>
              ) : (
                <ol className="mt-4 space-y-4">
                  {ticket.events.map((event, index) => (
                    <li key={`${event.created_at}-${index}`} className="flex gap-2.5">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {event.status ? <StatusPill status={event.status} /> : null}
                          <span className="text-[11.5px] text-muted">
                            {formatRelative(event.created_at)}
                          </span>
                        </div>
                        {event.body ? (
                          <p className="mt-1 text-[13px] leading-5 text-muted">{event.body}</p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
              <p className="mt-5 text-[12px] leading-5 text-muted">
                Hi {ticket.customer_name}. If something looks wrong, call the shop and quote{" "}
                <span className="figure text-ink">{ticket.ticket_number}</span>.
              </p>
            </Panel>
          </div>
        ) : (
          <div className="mt-8">
            <h2 className="text-[14px] font-semibold text-ink">What the stages mean</h2>
            <ol className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[...RAIL, "picked_up"].map((status) => (
                <li key={status} className="rounded bg-surface px-3.5 py-3">
                  <StatusPill status={status as TicketStatus} />
                  <p className="mt-1.5 text-[12.5px] leading-5 text-muted">
                    {TICKET_STATUS_META[status as TicketStatus].description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      <footer className="bg-surface">
        <div className="mx-auto flex max-w-[1000px] flex-wrap items-center justify-between gap-2 px-5 py-4 text-[12.5px] text-muted sm:px-6">
          <p>Patchwork · Repair operations</p>
          <p>Customers see status only. Staff manage the rest.</p>
        </div>
      </footer>
    </main>
  );
}
