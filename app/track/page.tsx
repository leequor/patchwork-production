import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { RepairTree } from "@/components/landing/repair-tree";
import { SiteFooter, SiteHeader } from "@/components/patchwork/site-frame";
import { SystemAlert } from "@/components/patchwork/system-alert";
import { DeviceStageMount } from "@/components/three/device-stage-mount";
import { formForCategory } from "@/lib/device-form";
import { RelativeTime } from "@/components/ui/relative-time";
import { StatusPill } from "@/components/workspace/ui";
import { DEVICE_CATEGORY_LABELS, formatDate, TICKET_STATUS_META } from "@/lib/repair/format";
import { getTrackedTicket } from "@/lib/repair/queries";
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
const PHASES: Array<{ number: string; title: string; body: string; stages: TicketStatus[] }> = [
  {
    number: "01",
    title: "Intake & diagnosis",
    body: "The device is booked in, tagged, and opened up. We find the fault and quote the fix before anything is ordered.",
    stages: ["intake", "diagnosing"],
  },
  {
    number: "02",
    title: "On the bench",
    body: "Parts arrive, the work happens, and the board moves. If a part is delayed you see waiting on parts, not silence.",
    stages: ["waiting_parts", "in_repair"],
  },
  {
    number: "03",
    title: "Ready & home",
    body: "Tested, cleaned, and waiting at the counter. The code keeps working after pickup, so the record stays with you.",
    stages: ["ready", "picked_up"],
  },
];

/** Honest numbers: what the product promises, not invented traction. */
const FACTS = [
  { value: "Ten", unit: "characters", note: "on your intake receipt" },
  { value: "Six", unit: "stages", note: "updated from the bench" },
  { value: "Zero", unit: "accounts", note: "no email, no phone" },
];

function railIndex(status: TicketStatus) {
  return RAIL.indexOf(status);
}

export default async function TrackPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const code = params.code?.trim() ?? "";
  const hasQuery = Boolean(code);
  const [ticket, staff] = await Promise.all([
    hasQuery ? getTrackedTicket(code) : Promise.resolve(null),
    getStaff(),
  ]);
  const current = ticket ? railIndex(ticket.status) : -1;
  const closed = ticket ? ["picked_up", "cancelled"].includes(ticket.status) : false;
  const stage = ticket?.status ?? "intake";

  return (
    <main className="relative min-h-[100dvh] overflow-x-clip">
      {/* The room: a blueprint grid under a tree that is lit from within. */}
      <section className="relative pb-6 sm:pb-8">
        <div className="grid-field pointer-events-none absolute inset-x-0 top-0 bottom-[-9rem]" aria-hidden="true" />

        <div
          className="pointer-events-none absolute right-[-14%] top-0 h-[54%] w-[104%] opacity-80 [mask-image:linear-gradient(to_bottom,#000_62%,transparent_100%)] sm:top-0 sm:h-[94%] sm:w-[70%] sm:opacity-100 sm:right-[-6%] lg:right-[-3%] lg:w-[52%]"
          aria-hidden="true"
        >
          <RepairTree className="h-full w-full [mask-image:radial-gradient(64%_70%_at_64%_44%,#000_26%,transparent_100%)]" />
        </div>

        {/* On a phone the copy runs the full width, so the art gets its own
            soft floor rather than sitting behind the paragraph. */}
        <div
          className="pointer-events-none absolute inset-x-0 top-[34%] h-[42%] bg-gradient-to-b from-transparent via-canvas/70 to-canvas sm:hidden"
          aria-hidden="true"
        />

        {/* The scrim: the head of the page stays dark so the headline never
            sits on a blossom. It fades out before the tree's trunk. */}
        <div
          className="pointer-events-none absolute inset-y-0 -bottom-36 left-0 w-full bg-gradient-to-r from-canvas via-canvas/90 to-transparent [mask-image:linear-gradient(to_bottom,#000_86%,transparent)] sm:w-[76%] lg:w-[66%]"
          aria-hidden="true"
        />

        <div className="relative mx-auto w-full max-w-[1180px] px-5 sm:px-8">
          <SiteHeader
            className="pt-6 sm:pt-8"
            back={staff ? { href: "/", label: "Back to bench" } : undefined}
            action={{ href: staff ? "/" : "/login", label: staff ? "Open bench" : "Staff sign in" }}
          />

          <div className="pt-16 sm:pt-24 lg:pt-28">
            <p className="eyebrow rise">
              <span className="sm:hidden">Repair operations</span>
              <span className="hidden sm:inline">Repair operations · live from the bench</span>
            </p>

            <h1 className="rise display-hero mt-6 max-w-[12ch] text-[clamp(44px,6.6vw,92px)] text-ink">
              Bring it back to life.
            </h1>

            <p
              className="rise mt-6 max-w-[44ch] font-sans text-[17px] leading-[1.6] text-ink-secondary"
              style={{ animationDelay: "70ms" }}
            >
              Ten characters from your intake receipt, and you can watch the bench work — no
              account, no email, no phone number.
            </p>

            {/* The docket: one field, one action, the help the customer needs. */}
            <form
              method="get"
              action="/track"
              className="rise mt-9 max-w-[540px]"
              style={{ animationDelay: "130ms" }}
            >
              <label htmlFor="code" className="sr-only">
                Tracking code
              </label>
              <div className="flex items-center gap-2 rounded-full border border-hairline-strong bg-panel/70 p-1.5 pl-4 backdrop-blur-md transition-colors duration-200 focus-within:border-accent/60 sm:pl-5">
                <input
                  id="code"
                  name="code"
                  defaultValue={code}
                  placeholder="TRACK10041"
                  aria-describedby="tracking-code-help"
                  autoComplete="off"
                  spellCheck={false}
                  required
                  className="h-11 min-w-0 flex-1 bg-transparent font-mono text-[14px] uppercase tracking-[0.12em] text-ink outline-none placeholder:text-ink-faint sm:text-[15px] sm:tracking-[0.2em]"
                />
                <button
                  type="submit"
                  className="primary group flex h-11 shrink-0 items-center gap-2 rounded-full px-5 font-sans text-[14px] font-semibold transition-[filter,transform] duration-150 active:translate-y-px"
                >
                  Check status
                  <ArrowRight
                    aria-hidden="true"
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    strokeWidth={2.2}
                  />
                </button>
              </div>
              <p
                id="tracking-code-help"
                className="mt-3 pl-5 font-sans text-[13px] leading-5 text-ink-tertiary"
              >
                Printed on the receipt next to the PW- ticket number. It is not the ticket number
                itself.
              </p>
            </form>

            <div className="rise mt-14 border-t border-hairline/70 pt-7 sm:mt-24">
              <dl className="grid max-w-[760px] grid-cols-3 gap-x-4 gap-y-6 sm:gap-x-6">
              {FACTS.map((fact, index) => (
                <div key={fact.unit} style={{ animationDelay: `${190 + index * 40}ms` }}>
                  <dd className="display-hero text-[clamp(22px,3.2vw,38px)] text-ink">
                    {fact.value}
                    <span className="ml-1.5 font-sans text-[13px] font-normal tracking-normal text-ink-tertiary">
                      {fact.unit}
                    </span>
                  </dd>
                  <dt className="mt-1.5 font-sans text-[13px] leading-5 text-ink-tertiary">
                    {fact.note}
                  </dt>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      <div className="relative mx-auto w-full max-w-[1180px] px-5 sm:px-8">
        {params.error || (hasQuery && !ticket) ? (
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
        <section id="stages" className="pt-10 sm:pt-14">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <div>
              <p className="eyebrow">The bench, stage by stage</p>
              <h2 className="display-hero mt-5 max-w-[18ch] text-[clamp(34px,5.2vw,74px)] text-ink">
                Intake. Diagnose. Repair.
              </h2>
            </div>
            {!hasQuery ? (
              <p className="mb-3 max-w-[26ch] font-sans text-[14px] leading-6 text-ink-tertiary">
                Bookmark this page and come back when you want to look.
              </p>
            ) : null}
          </div>

          <div className="mt-10 grid overflow-hidden rounded-md border border-hairline/80 sm:grid-cols-3">
            {PHASES.map((phase) => (
              <div
                key={phase.number}
                className="border-b border-hairline/80 bg-panel/40 p-6 last:border-b-0 sm:border-b-0 sm:border-r sm:p-7 sm:last:border-r-0"
              >
                <p className="figure text-[12px] text-ink-faint">{phase.number}</p>
                <h3 className="mt-3 font-sans text-[17px] font-medium text-ink">{phase.title}</h3>
                <p className="mt-2.5 font-sans text-[14px] leading-6 text-ink-secondary">
                  {phase.body}
                </p>
                <ul className="mt-5 flex flex-wrap gap-1.5">
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
