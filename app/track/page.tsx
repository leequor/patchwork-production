import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { RepairTree } from "@/components/landing/repair-tree";
import { PointerDust } from "@/components/patchwork/pointer-dust";
import { ReactiveGrid } from "@/components/patchwork/reactive-grid";
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
      {/* The room: the tree fills the whole frame, canopy bleeding off the top
          and the trunk rooting at the floor, exactly the way a full-bleed
          artwork works. Everything else is scrim and quiet, so the light can be
          the loud thing. */}
      <section className="relative flex min-h-[100svh] flex-col pb-6 sm:pb-8">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -bottom-[9rem] opacity-90 [mask-image:linear-gradient(to_bottom,#000_0%,#000_76%,transparent_92%)]"
          aria-hidden="true"
        >
          <RepairTree className="h-full w-full" />
        </div>

        <ReactiveGrid className="pointer-events-none absolute inset-x-0 top-0 bottom-[-9rem]" />

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
          className="pointer-events-none absolute inset-x-0 top-[20%] h-[54%] bg-[linear-gradient(to_bottom,transparent,rgba(9,8,15,0.72)_42%,rgba(9,8,15,0.95)_78%,#09080f)] sm:hidden"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[linear-gradient(to_bottom,rgba(9,8,15,0.95),rgba(9,8,15,0.55)_58%,transparent)]"
          aria-hidden="true"
        />

        <PointerDust className="pointer-events-none absolute inset-0 h-full w-full" />

        <div className="relative mx-auto flex w-full max-w-[1180px] flex-1 flex-col px-5 sm:px-8">
          <SiteHeader
            className="pt-6 sm:pt-8"
            back={staff ? { href: "/", label: "Back to bench" } : undefined}
            action={{ href: staff ? "/" : "/login", label: staff ? "Open bench" : "Staff sign in" }}
          />

          <div className="pt-16 sm:pt-[16vh] lg:pt-[18vh]">
            <p className="eyebrow rise">
              <span className="sm:hidden">Repair operations</span>
              <span className="hidden sm:inline">Repair operations · live from the bench</span>
            </p>

            <h1 className="rise display-hero mt-6 max-w-[13ch] text-[clamp(44px,6.2vw,84px)] text-ink">
              Where is my repair?
            </h1>

            <p
              className="rise mt-6 max-w-[32ch] font-sans text-[17px] leading-[1.6] text-ink-secondary sm:max-w-[44ch]"
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
              <div className="flex items-center gap-2 rounded-full bg-[#0b0916]/72 p-1.5 pl-4 ring-1 ring-inset ring-white/[0.08] backdrop-blur-md transition-[box-shadow] duration-200 focus-within:ring-white/[0.22] sm:pl-5">
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
                className="mt-3 max-w-[42ch] pl-5 font-sans text-[13px] leading-5 text-ink-secondary"
              >
                Printed on the receipt next to the PW- ticket number. It is not the ticket number
                itself.
              </p>
            </form>

            <div className="rise mt-auto pt-12">
              <div aria-hidden="true" className="h-px w-full bg-[linear-gradient(to_right,rgba(241,239,250,0.16),rgba(241,239,250,0.07)_54%,transparent)]" />
              <div className="max-w-[620px] pt-7">
              <div className="grid grid-cols-3 gap-x-4 gap-y-6 sm:gap-x-6">
              {FACTS.map((fact, index) => (
                <div key={fact.unit} style={{ animationDelay: `${190 + index * 40}ms` }}>
                  <p className="display-hero text-[clamp(24px,3.2vw,40px)] text-ink">
                    {fact.value}
                  </p>
                  <p className="mt-2 font-mono text-2xs uppercase tracking-[0.18em] text-ink-tertiary">
                    {fact.unit}
                  </p>
                  <p className="mt-1 font-sans text-[13px] leading-5 text-ink-tertiary">
                    {fact.note}
                  </p>
                  </div>
                ))}
                </div>
              </div>
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
        <section id="stages" className="relative pt-10 sm:pt-14">
          {/* The hero ends on its darkest note; this hands the eye back into the
              room instead of starting the next section at full glow. */}
          <div
            className="pointer-events-none absolute inset-x-0 -top-[8vh] h-[16vh] bg-[linear-gradient(to_bottom,transparent,rgba(9,8,15,0.85)_55%,transparent)] sm:-top-[10vh] sm:h-[20vh]"
            aria-hidden="true"
          />
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

          <div className="mt-10 grid overflow-hidden rounded-lg border border-white/[0.09] sm:grid-cols-3">
            {PHASES.map((phase) => (
              <div
                key={phase.number}
                className="border-b border-white/[0.07] bg-white/[0.015] p-6 last:border-b-0 sm:border-b-0 sm:border-r sm:p-7 sm:last:border-r-0"
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
