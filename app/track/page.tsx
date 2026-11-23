import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/patchwork/site-frame";
import { SystemAlert } from "@/components/patchwork/system-alert";
import { DeviceStageMount } from "@/components/three/device-stage-mount";
import { RelativeTime } from "@/components/ui/relative-time";
import { StatusPill } from "@/components/workspace/ui";
import { DEVICE_CATEGORY_LABELS, formatDate, TICKET_STATUS_META } from "@/lib/repair/format";
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

const GLOSSARY: Array<{ status: TicketStatus; note: string }> = [
  ...RAIL.map((status) => ({ status, note: TICKET_STATUS_META[status].description })),
  { status: "picked_up", note: TICKET_STATUS_META.picked_up.description },
];

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
  const stage = ticket?.status ?? "intake";

  return (
    <main className="min-h-[100dvh]">
      <div className="mx-auto w-full max-w-[1180px] px-5 pb-10 sm:px-8">
        <SiteHeader className="pt-6 sm:pt-8" action={{ href: "/login", label: "Staff sign in" }} />

        <section className="pt-12 sm:pt-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:items-center lg:gap-14">
            <div>
              <h1 className="rise display max-w-[14ch] text-[clamp(42px,6.2vw,78px)] text-ink">
                Where is my repair?
              </h1>
              <p
                className="rise mt-5 max-w-[46ch] font-sans text-[17px] leading-[1.55] text-ink-secondary"
                style={{ animationDelay: "70ms" }}
              >
                Type the ten-character code from your intake receipt. No account, email or phone
                number needed.
              </p>

              {/* The docket: one field, one action, the help the customer needs. */}
              <div className="rise mt-8" style={{ animationDelay: "130ms" }}>
              <form method="get" action="/track">
                <label
                  htmlFor="code"
                  className="block font-sans text-[13px] font-medium text-ink-secondary"
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
                  required
                  className="field-inset mt-2 h-14 w-full rounded-sm px-4 font-mono text-[21px] uppercase tracking-[0.16em] text-ink outline-none transition-shadow duration-200"
                />
                <button
                  type="submit"
                  className="brass group mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-sm font-sans text-[14px] font-semibold transition-[filter,transform] duration-150 active:translate-y-px"
                >
                  Check status
                  <ArrowRight
                    aria-hidden="true"
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    strokeWidth={2.2}
                  />
                </button>
                <p
                  id="tracking-code-help"
                  className="mt-3 font-sans text-[13px] leading-5 text-ink-tertiary"
                >
                  Printed on the receipt next to the PW- ticket number. It is not the ticket number
                  itself.
                  </p>
                </form>
              </div>
            </div>

            {/* The device itself: closed at intake, open on the bench mid-repair. */}
            <div
              className="rise relative -mx-5 sm:-mx-8 lg:mx-0"
              style={{ animationDelay: "190ms" }}
            >
              <DeviceStageMount
                status={stage}
                quality="high"
                className="h-[340px] w-full sm:h-[420px] lg:h-[500px]"
                caption={
                  ticket
                    ? `${TICKET_STATUS_META[ticket.status].label} · ${ticket.ticket_number}`
                    : "Bench view · nothing open"
                }
              />
            </div>
          </div>
        </section>

        <div className="mt-14 sm:mt-20">
          {params.error || (hasQuery && !ticket) ? (
            <SystemAlert title={params.error ? "Request failed" : "No match"}>
              {params.error ||
                "No ticket matched that code. Check the ten characters on the receipt."}
            </SystemAlert>
          ) : null}

          {ticket ? (
            <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
              <section className="rounded-md bg-panel p-5 sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                  <div className="min-w-0">
                    <p className="figure text-[13px] text-ink-tertiary">{ticket.ticket_number}</p>
                    <h2 className="display-tight mt-1.5 text-[26px] text-ink sm:text-[30px]">
                      {ticket.device.brand} {ticket.device.model}
                    </h2>
                  </div>
                  <StatusPill status={ticket.status} />
                </div>

                <p className="mt-2 font-sans text-[14px] text-ink-tertiary">
                  {DEVICE_CATEGORY_LABELS[ticket.device.category] ?? ticket.device.category} ·
                  opened {formatDate(ticket.created_at)} · updated{" "}
                  <RelativeTime value={ticket.updated_at} />
                </p>

                <div className="mt-7">
                  <p className="font-sans text-[13px] font-medium text-ink-secondary">Progress</p>
                  <ol aria-label="Repair stages" className="mt-2.5 grid grid-cols-5 gap-1.5">
                    {RAIL.map((status, index) => {
                      const reached = !closed && current >= index;
                      const blocked = status === "waiting_parts" && current === 2;
                      return (
                        <li key={status}>
                          <span
                            className={cn(
                              "block h-1",
                              blocked ? "bg-warn" : reached ? "bg-accent" : "bg-overlay",
                            )}
                            aria-hidden="true"
                          />
                          <span
                            className={cn(
                              "mt-2 block font-sans text-[13px] leading-4",
                              reached ? "text-ink" : "text-ink-tertiary",
                            )}
                          >
                            {TICKET_STATUS_META[status].label}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                  {closed ? (
                    <p className="mt-4 font-sans text-[14px] text-ink-secondary">
                      This repair is closed. Call the shop if you need it reopened.
                    </p>
                  ) : null}
                </div>

                <div className="mt-6 border-t border-hairline pt-4">
                  <p className="font-sans text-[13px] text-ink-tertiary">What we are working on</p>
                  <p className="mt-1.5 font-sans text-[15px] leading-6 text-ink">{ticket.issue}</p>
                </div>

                <p className="mt-4 font-sans text-[14px] leading-6 text-ink-secondary">
                  Current stage: {TICKET_STATUS_META[ticket.status].label}.{" "}
                  {TICKET_STATUS_META[ticket.status].description}
                </p>
              </section>

              <section className="rounded-md bg-panel p-5 sm:p-7">
                <h2 className="font-sans text-[15px] font-semibold text-ink">Timeline</h2>
                <p className="mt-0.5 font-sans text-[13px] text-ink-tertiary">
                  Updates the bench shared with you.
                </p>
                {ticket.events.length === 0 ? (
                  <p className="mt-4 font-sans text-[14px] text-ink-secondary">No updates yet.</p>
                ) : (
                  <ol className="mt-5 space-y-5">
                    {ticket.events.map((event, index) => (
                      <li key={`${event.created_at}-${index}`} className="flex gap-3">
                        <span
                          className="mt-[7px] h-1.5 w-1.5 shrink-0 bg-accent"
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            {event.status ? <StatusPill status={event.status} /> : null}
                            <RelativeTime
                              value={event.created_at}
                              className="font-sans text-[13px] text-ink-tertiary"
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
                <p className="mt-6 border-t border-hairline pt-4 font-sans text-[13px] leading-5 text-ink-tertiary">
                  Hi {ticket.customer_name}. If something looks wrong, call the shop and quote{" "}
                  <span className="figure text-ink">{ticket.ticket_number}</span>.
                </p>
              </section>
            </div>
          ) : null}
        </div>

        {!ticket ? (
          <section className="mt-16 sm:mt-20">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              <h2 className="rise display-tight text-[26px] text-ink sm:text-[30px]">
                What the stages mean
              </h2>
              {!hasQuery ? (
                <p className="font-sans text-[14px] text-ink-tertiary">
                  Bookmark this page and come back when you want to look.
                </p>
              ) : null}
            </div>

            <dl className="mt-6 border-t border-hairline">
              {GLOSSARY.map(({ status, note }) => (
                <div
                  key={status}
                  className="grid grid-cols-[minmax(0,168px)_minmax(0,1fr)] items-baseline gap-4 border-b border-hairline py-3.5 sm:gap-8"
                >
                  <dt>
                    <StatusPill status={status} />
                  </dt>
                  <dd className="font-sans text-[14px] leading-6 text-ink-secondary">{note}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        <SiteFooter className="mt-12 sm:mt-16" />

        <p className="mt-5 font-sans text-[13px] text-ink-faint">
          <Link href="/status" className="transition-colors hover:text-ink-tertiary sm:hidden">
            System status
          </Link>
        </p>
      </div>
    </main>
  );
}
