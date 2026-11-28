import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { RepairPlate } from "@/components/landing/repair-plate";
import { RepairTree } from "@/components/landing/repair-tree";
import { ReactiveGrid } from "@/components/patchwork/reactive-grid";
import { SiteFooter, SiteHeader } from "@/components/patchwork/site-frame";
import { SystemAlert } from "@/components/patchwork/system-alert";
import { DeviceStageMount } from "@/components/three/device-stage-mount";
import { formForCategory } from "@/lib/device-form";
import { RelativeTime } from "@/components/ui/relative-time";
import { StatusPill } from "@/components/workspace/ui";
import { DEVICE_CATEGORY_LABELS, formatDate, TICKET_STATUS_META } from "@/lib/repair/format";
import { getTrackedTicket, isRecordsUnavailable } from "@/lib/repair/queries";
import { getStaff } from "@/lib/repair/session";
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

/** Three phases, because six stages is what the bench uses and three is what a customer needs. */
const PHASES: Array<{ plate: "intake" | "bench" | "pickup"; title: string; body: string; stages: TicketStatus[] }> = [
  {
    plate: "intake",
    title: "Intake & diagnosis",
    body: "The device is booked in, tagged, and opened up. We find the fault and quote the fix before anything is ordered.",
    stages: ["intake", "diagnosing"],
  },
  {
    plate: "bench",
    title: "On the bench",
    body: "Parts arrive, the work happens, and the board moves. If a part is delayed you see waiting on parts, not silence.",
    stages: ["waiting_parts", "in_repair"],
  },
  {
    plate: "pickup",
    title: "Ready & home",
    body: "Tested, cleaned, and waiting at the counter. The code keeps working after pickup, so the record stays with you.",
    stages: ["ready", "picked_up"],
  },
];

function railIndex(status: TicketStatus) {
  return RAIL.indexOf(status);
}

export default async function TrackPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const code = params.code?.trim() ?? "";
  const hasQuery = Boolean(code);

  /* A tracker that dies on a bad code is a tracker nobody trusts. If the records
     are unreachable the customer gets the truth — "we cannot check right now" —
     not a lie ("no repair with that code") and not a stack trace. */
  let ticket = null;
  let staff = null;
  let recordsDown = false;

  try {
    [ticket, staff] = await Promise.all([
      hasQuery ? getTrackedTicket(code) : Promise.resolve(null),
      getStaff(),
    ]);
  } catch (error) {
    if (!isRecordsUnavailable(error)) throw error;
    recordsDown = true;
    console.error("[track] records unreachable:", error);
  }

  const current = ticket ? railIndex(ticket.status) : -1;
  const closed = ticket ? ["picked_up", "cancelled"].includes(ticket.status) : false;
  const stage = ticket?.status ?? "intake";
  const showResult = hasQuery || Boolean(params.error) || recordsDown;

  return (
    <main className="relative min-h-[100dvh] overflow-x-clip">
      {/* The room: the tree fills the whole frame, canopy bleeding off the top
          and the trunk rooting at the floor, exactly the way a full-bleed
          artwork works. Everything else is scrim and quiet, so the light can be
          the loud thing. */}
      <section className={cn("relative isolate flex flex-col", showResult ? "pb-8" : "min-h-[min(91svh,920px)] pb-10 sm:pb-14")}>
        {!showResult && (
          <RepairTree
            className="pointer-events-none absolute inset-0 -z-20 [mask-image:linear-gradient(to_bottom,#000_65%,transparent)]"
            controlPosition="right-5 top-24 sm:right-[max(2rem,calc((100%-1116px)/2))]"
          />
        )}

        <ReactiveGrid className="pointer-events-none absolute inset-0 -z-10" />

        {/* Two scrims, not one: the floor keeps the facts legible, the wall keeps
            the headline legible. Both stay weak enough that canopy and petals
            still read across the middle of the frame. */}
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_38%,rgba(9,8,15,0.8)_66%,rgba(9,8,15,0.58)_88%,transparent_100%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(9,8,15,0.9)_0%,rgba(9,8,15,0.62)_30%,rgba(9,8,15,0.18)_58%,transparent_80%)]"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_15%,rgba(9,8,15,.7)_58%,#09080f)] sm:hidden"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[linear-gradient(to_bottom,rgba(9,8,15,0.95),rgba(9,8,15,0.55)_58%,transparent)]"
          aria-hidden="true"
        />

        <div className="relative mx-auto flex w-full max-w-[1180px] flex-1 flex-col px-5 sm:px-8">
          <SiteHeader
            className="pt-6 sm:pt-8"
            back={staff ? { href: "/", label: "Back to bench" } : undefined}
            action={{ href: staff ? "/" : "/login", label: staff ? "Open bench" : "Staff sign in" }}
            showSignIn={false}
          />

          <div className={cn("relative mt-auto grid items-end gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(340px,.8fr)] lg:gap-16", showResult ? "pt-10" : "pt-[18svh] sm:pt-[24svh]")}>
            <div>
              <h1 className={cn("rise display-hero max-w-[12ch] text-ink", showResult ? "text-[clamp(36px,4.5vw,62px)]" : "text-[clamp(54px,7.4vw,104px)]")}>
                Where is my repair?
              </h1>
              <p className="rise mt-5 max-w-[37ch] text-[17px] leading-relaxed text-ink-secondary" style={{ animationDelay: "70ms" }}>
                Follow your device from the intake counter to pickup. All you need is the code on your receipt.
              </p>
            </div>

            {/* The docket: one field, one action, the help the customer needs. */}
            <form
              method="get"
              action="/track"
              className="claim-check rise w-full max-w-[500px] justify-self-start lg:justify-self-end"
              style={{ animationDelay: "130ms" }}
            >
              <div className="claim-stub"><span>Patchwork</span><span>Customer copy</span></div>
              <div className="px-4 pb-5 pt-4 sm:px-6 sm:pb-6">
                <label htmlFor="code" className="block text-sm font-semibold">Tracking code</label>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <input
                    id="code"
                    name="code"
                    defaultValue={code}
                    placeholder="TRACK10041"
                    aria-describedby="tracking-code-help"
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    required
                    className="claim-code h-12 min-w-[8.5rem] flex-1 rounded px-3 font-mono text-base uppercase tracking-[.06em]"
                  />
                  <button
                    type="submit"
                    className="group flex h-12 grow items-center justify-center gap-1.5 rounded bg-canvas px-3 text-sm font-semibold text-ink transition-colors hover:bg-overlay sm:grow-0"
                  >
                    Check status
                    <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2.2} />
                  </button>
                </div>
                <p id="tracking-code-help" className="mt-3 text-[13px] leading-5">
                  Use the ten characters beside your PW- ticket number. No account needed.
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>

      <div className="relative mx-auto w-full max-w-[1180px] px-5 sm:px-8">
        {recordsDown ? (
          <div className="pb-2">
            <SystemAlert title="Records are unreachable">
              The desk cannot check that code right now. Try again in a moment, or contact the shop with your ticket number.
            </SystemAlert>
          </div>
        ) : params.error || (hasQuery && !ticket) ? (
          <SystemAlert title={params.error ? "Request failed" : "No match"}>
            {params.error ||
              "No ticket matched that code. Check the ten characters on the receipt."}
          </SystemAlert>
        ) : null}

        {ticket ? (
          <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="hairline-glow rounded-md bg-panel p-5 pt-6 sm:p-7 sm:pt-8">
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                <div className="min-w-0">
                  <p className="figure text-[13px] text-ink-tertiary">{ticket.ticket_number}</p>
                  <h2 className="display-tight mt-1.5 text-[26px] text-ink sm:text-[30px]">
                    {ticket.device.brand} {ticket.device.model}
                  </h2>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1">
                  <StatusPill status={ticket.status} />
                  <Link
                    href="/track"
                    className="font-sans text-[13px] text-ink-tertiary transition-colors hover:text-ink"
                  >
                    Track another code
                  </Link>
                </div>
              </div>

              <p className="mt-2 font-sans text-[14px] text-ink-tertiary">
                {DEVICE_CATEGORY_LABELS[ticket.device.category] ?? ticket.device.category} · opened{" "}
                {formatDate(ticket.created_at)} · updated <RelativeTime value={ticket.updated_at} />
              </p>

              {/* The device, open or closed depending on where the repair is. */}
              <div className="relative mt-6">
                <div className="iris" />
                <div className="bench-ticks relative">
                  <DeviceStageMount
                    status={stage}
                    form={formForCategory(ticket.device.category)}
                    quality="high"
                    className="h-[260px] w-full sm:h-[320px]"
                    caption={`${TICKET_STATUS_META[ticket.status].label} · ${ticket.ticket_number}`}
                  />
                </div>
              </div>

              <div className="mt-6">
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

            <section className="hairline-glow rounded-md bg-panel p-5 pt-6 sm:p-7 sm:pt-8">
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
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 bg-accent" aria-hidden="true" />
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

        {/* Three phases instead of six stages: what a customer actually needs. */}
        <section id="stages" className="relative pt-10 sm:pt-14">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <div>
              <h2 className="display-hero max-w-[20ch] text-[clamp(36px,5vw,68px)] text-ink">
                Intake. Diagnose. Repair.
              </h2>
            </div>
            {!hasQuery ? (
              <p className="mb-3 max-w-[26ch] font-sans text-[14px] leading-6 text-ink-tertiary">
                Six repair stages, from the first inspection to the handover.
              </p>
            ) : null}
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-3 sm:gap-5">
            {PHASES.map((phase) => (
              <div
                key={phase.plate}
                className="min-w-0"
              >
                <div className="plate-ground rounded-md text-ink-tertiary"><RepairPlate phase={phase.plate} /></div>
                <h3 className="display-tight mt-5 text-[23px] text-ink">{phase.title}</h3>
                <p className="mt-2.5 font-sans text-[14px] leading-6 text-ink-secondary">
                  {phase.body}
                </p>
                <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                  {phase.stages.map((status) => (
                    <li key={status}>
                      <StatusPill status={status} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
