import Link from "next/link";
import type { Metadata } from "next";

import { Logo } from "@/components/ui/logo";
import { ArchiveStrip } from "@/components/patchwork/archive-strip";
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
    <main className="min-h-[100dvh] bg-paper">
      <section className="bg-night px-4 pb-10 pt-5 sm:px-6 sm:pb-14">
        <div className="mx-auto w-full max-w-[1100px]">
          <header className="flex items-center justify-between gap-4">
            <Logo href="/" tone="night" />
            <div className="flex items-center gap-5">
              <Link
                href="/status"
                className="hidden font-sans text-[13px] text-creamMuted transition-colors hover:text-cream sm:block"
              >
                System status
              </Link>
              <Link
                href="/login"
                className="inline-flex h-10 items-center rounded-sm bg-cream px-3.5 font-sans text-[13px] font-semibold text-night transition-colors hover:bg-white"
              >
                Staff sign in
              </Link>
            </div>
          </header>

          <div className="mt-12 flex flex-wrap items-end justify-between gap-x-10 gap-y-6 sm:mt-16">
            <div className="max-w-[34rem]">
              <h1 className="rise display text-[clamp(36px,4.6vw,64px)] text-cream">
                Where is my repair?
              </h1>
              <p
                className="rise mt-4 max-w-[44ch] font-serif text-[17px] leading-[1.55] text-creamMuted"
                style={{ animationDelay: "80ms" }}
              >
                Type the ten-character code from your intake receipt. No account, email or phone
                number needed.
              </p>
            </div>

            <form
              className="rise w-full max-w-[420px] rounded-sm bg-paper p-4 sm:p-5"
              method="get"
              action="/track"
              style={{ animationDelay: "160ms" }}
            >
              <label htmlFor="code" className="font-sans text-[13px] font-semibold text-ink">
                Tracking code
              </label>
              <input
                id="code"
                name="code"
                defaultValue={code}
                placeholder="TRACK10041"
                aria-describedby="tracking-code-help"
                className="figure mt-1.5 h-12 w-full rounded-sm border border-line bg-raised px-3 text-[17px] uppercase tracking-[0.08em] text-ink outline-none placeholder:font-serif placeholder:normal-case placeholder:tracking-normal placeholder:text-muted/60 focus:border-accent"
                required
              />
              <button
                type="submit"
                className="mt-2.5 h-12 w-full rounded-sm bg-accent font-sans text-[15px] font-semibold text-onAccent transition-[background-color,transform] duration-150 hover:bg-gold active:scale-[0.99]"
              >
                Check status
              </button>
              <p id="tracking-code-help" className="mt-2 font-serif text-[13px] leading-5 text-muted">
                Printed on the receipt next to the PW- ticket number. It is not the ticket number
                itself.
              </p>
            </form>
          </div>

          <ArchiveStrip className="mt-10" />
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1100px] px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <div className="rounded-sm bg-surface px-4 py-3 sm:px-5">
          <Feedback
            error={
              params.error ||
              (hasQuery && !ticket
                ? "No ticket matched that code. Check the ten characters on the receipt."
                : undefined)
            }
          />
          {!hasQuery ? (
            <p className="font-serif text-[14px] leading-6 text-muted">
              The shop updates this page as the job moves. Bookmark it and come back when you want
              to look.
            </p>
          ) : null}
        </div>

        {ticket ? (
          <div className="mt-3 grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
            <Panel className="p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="figure text-[13px] text-muted">{ticket.ticket_number}</p>
                  <h2 className="display mt-1.5 text-[26px] text-ink">
                    {ticket.device.brand} {ticket.device.model}
                  </h2>
                </div>
                <StatusPill status={ticket.status} />
              </div>

              <p className="mt-2 font-serif text-[14px] text-muted">
                {DEVICE_CATEGORY_LABELS[ticket.device.category] ?? ticket.device.category} · opened{" "}
                {formatDate(ticket.created_at)} · updated {formatRelative(ticket.updated_at)}
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
                            blocked ? "bg-warn" : reached ? "bg-accent" : "bg-wash",
                          )}
                          aria-hidden="true"
                        />
                        <span
                          className={cn(
                            "mt-2 block font-sans text-[13px] leading-4",
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
                  <p className="mt-3 font-serif text-[14px] text-muted">
                    This repair is closed. Call the shop if you need it reopened.
                  </p>
                ) : null}
              </div>

              <div className="mt-6 rounded-sm bg-paper px-4 py-3.5">
                <p className="font-sans text-[13px] text-muted">What we are working on</p>
                <p className="mt-1.5 font-serif text-[15px] leading-6 text-ink">{ticket.issue}</p>
              </div>

              <p className="mt-3 font-serif text-[14px] leading-6 text-muted">
                Current stage: {TICKET_STATUS_META[ticket.status].label}.{" "}
                {TICKET_STATUS_META[ticket.status].description}
              </p>
            </Panel>

            <Panel className="p-5 sm:p-6">
              <h2 className="font-sans text-[15px] font-semibold text-ink">Timeline</h2>
              <p className="mt-0.5 font-serif text-[13px] text-muted">
                Updates the bench shared with you.
              </p>
              {ticket.events.length === 0 ? (
                <p className="mt-4 font-serif text-[14px] text-muted">No updates yet.</p>
              ) : (
                <ol className="mt-5 space-y-4">
                  {ticket.events.map((event, index) => (
                    <li key={`${event.created_at}-${index}`} className="flex gap-3">
                      <span
                        className="mt-2 h-2 w-2 shrink-0 bg-accent"
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {event.status ? <StatusPill status={event.status} /> : null}
                          <span className="font-sans text-[13px] text-muted">
                            {formatRelative(event.created_at)}
                          </span>
                        </div>
                        {event.body ? (
                          <p className="mt-1 font-serif text-[14px] leading-6 text-muted">
                            {event.body}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
              <p className="mt-6 border-t border-line pt-4 font-serif text-[13px] leading-5 text-muted">
                Hi {ticket.customer_name}. If something looks wrong, call the shop and quote{" "}
                <span className="figure text-ink">{ticket.ticket_number}</span>.
              </p>
            </Panel>
          </div>
        ) : (
          <div className="mt-6">
            <h2 className="rise display text-[24px] text-ink">What the stages mean</h2>
            <ol className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[...RAIL, "picked_up"].map((status, index) => (
                <li
                  key={status}
                  className="rise rounded-sm bg-surface px-4 py-4"
                  style={{ animationDelay: `${80 + index * 60}ms` }}
                >
                  <StatusPill status={status as TicketStatus} />
                  <p className="mt-2 font-serif text-[14px] leading-6 text-muted">
                    {TICKET_STATUS_META[status as TicketStatus].description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      <footer className="px-4 py-8 sm:px-6">
        <div className="mx-auto flex w-full max-w-[1100px] flex-wrap items-center justify-between gap-2 font-sans text-[13px] text-muted">
          <p>Patchwork · Repair operations</p>
          <p>Customers see status only. Staff manage the rest.</p>
        </div>
      </footer>
    </main>
  );
}
