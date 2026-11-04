"use client";

import { AnimatePresence, motion, useMotionValue } from "framer-motion";
import { ArrowUpRight, Boxes, Receipt, Wrench } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { RelativeTime } from "@/components/ui/relative-time";
import {
  PRIORITY_META,
  TICKET_STATUS_META,
  formatCompactMoney,
  formatMoney,
} from "@/lib/repair/format";
import type { TicketRow } from "@/lib/repair/types";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { cn, initials } from "@/lib/utils";

import { ExplodedDevice } from "./exploded-device";

const PAGE_SIZE = 12;

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="px-3.5 py-3">
      <p className={cn("figure text-[17px] font-semibold leading-none text-ink", tone)}>{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-ink-faint">{label}</p>
    </div>
  );
}

function FloatPill({
  label,
  value,
  mark,
  className,
}: {
  label: string;
  value: string;
  mark: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "absolute hidden items-center gap-2.5 rounded-full border border-hairline-strong bg-panel/60 py-1.5 pl-1.5 pr-4 shadow-lift backdrop-blur-xl lg:flex",
        className,
      )}
    >
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-hairline bg-raised">
        {mark}
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-[9px] uppercase tracking-[0.16em] text-ink-faint">{label}</span>
        <span className="mt-0.5 text-[12px] font-medium text-ink">{value}</span>
      </span>
    </div>
  );
}

function QueueRow({
  ticket,
  active,
  onSelect,
  rowRef,
}: {
  ticket: TicketRow;
  active: boolean;
  onSelect: () => void;
  rowRef: (node: HTMLButtonElement | null) => void;
}) {
  const status = TICKET_STATUS_META[ticket.status];
  const priority = PRIORITY_META[ticket.priority];

  return (
    <button
      ref={rowRef}
      type="button"
      role="option"
      aria-selected={active}
      onClick={onSelect}
      className={cn(
        "group relative flex w-full items-start gap-3 border-b border-hairline/60 px-4 py-2.5 text-left transition-colors duration-150",
        active ? "bg-raised" : "hover:bg-raised/50",
      )}
    >
      {active ? (
        <span
          aria-hidden="true"
          className="absolute inset-y-2 left-0 w-[2px] rounded-full bg-accent-lit"
        />
      ) : null}

      <span className={cn("mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full", priority.dot)} aria-hidden="true" />

      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[13px] font-semibold text-ink">
            {ticket.customer.full_name}
          </span>
          <RelativeTime
            value={ticket.created_at}
            className="shrink-0 font-mono text-[10px] text-ink-faint"
          />
        </span>

        <span className="mt-0.5 flex items-baseline gap-1.5">
          <span className="mono-id text-[11px]">{ticket.ticket_number}</span>
          <span aria-hidden="true" className="text-ink-faint">
            ·
          </span>
          <span className="truncate text-[11px] text-ink-tertiary">
            {ticket.device.brand} {ticket.device.model}
          </span>
        </span>

        <span className="mt-1 flex items-center gap-1.5">
          <span className={cn("h-1 w-1 rounded-full", status.dot)} aria-hidden="true" />
          <span className={cn("text-[11px]", status.tone)}>{status.label}</span>
        </span>
      </span>
    </button>
  );
}

/**
 * Mission Control: the queue is the instrument, the bench is the stage. One
 * screen, no scrolling the page — the two panels scroll and swap independently.
 */
export function MissionControl({
  queue,
  openCount,
  readyCount,
  revenueMtd,
  lowStockCount,
}: {
  queue: TicketRow[];
  openCount: number;
  readyCount: number;
  revenueMtd: number;
  lowStockCount: number;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(queue[0]?.id ?? null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [mobileView, setMobileView] = useState<"queue" | "bench">("queue");
  const sentinelRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const reduced = usePrefersReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const visible = useMemo(() => queue.slice(0, visibleCount), [queue, visibleCount]);
  const selected = queue.find((ticket) => ticket.id === selectedId) ?? queue[0] ?? null;

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisibleCount((count) => Math.min(queue.length, count + PAGE_SIZE));
        }
      },
      { rootMargin: "160px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [queue.length]);

  const trackPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    pointerX.set(((event.clientX - rect.left) / rect.width - 0.5) * 2);
    pointerY.set(((event.clientY - rect.top) / rect.height - 0.5) * 2);
  };

  const move = (delta: number) => {
    if (!selected) return;
    const index = visible.findIndex((ticket) => ticket.id === selected.id);
    const next = Math.min(visible.length - 1, Math.max(0, index + delta));
    const target = visible[next];
    if (!target) return;
    setSelectedId(target.id);
    rowRefs.current[next]?.focus();
  };

  if (queue.length === 0) {
    return (
      <section className="flex h-full min-h-0 flex-col">
        <h1 className="sr-only">Mission control</h1>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-hairline bg-panel/40 p-8 text-center">
          <h2 className="display text-[28px] text-ink">The bench is clear</h2>
          <p className="max-w-[46ch] text-[13px] leading-6 text-ink-secondary">
            No devices are waiting. Take the first intake and it lands in the live queue immediately.
          </p>
          <Link
            href="/tickets/new"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent-fill px-4 text-[13px] font-semibold text-white transition hover:brightness-110"
          >
            New intake
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-full min-h-0 flex-col">
      <h1 className="sr-only">Mission control</h1>

      <div className="mb-3 flex gap-1 rounded-xl border border-hairline bg-panel/50 p-1 lg:hidden">
        {(["queue", "bench"] as const).map((view) => (
          <button
            key={view}
            type="button"
            aria-pressed={mobileView === view}
            onClick={() => setMobileView(view)}
            className={cn(
              "h-8 flex-1 rounded-lg text-[12px] font-medium capitalize transition-colors",
              mobileView === view ? "bg-raised text-ink" : "text-ink-tertiary",
            )}
          >
            {view}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-hairline bg-panel/40">
        {/* The queue */}
        <motion.aside
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 30, delay: 0.04 }}
          className={cn(
            "min-w-0 flex-col border-hairline bg-canvas/40 lg:flex lg:w-[35%] lg:min-w-[320px] lg:max-w-[440px] lg:border-r",
            mobileView === "queue" ? "flex w-full" : "hidden",
          )}
        >
          <div className="grid grid-cols-3 divide-x divide-hairline border-b border-hairline">
            <Stat label="Open" value={String(openCount)} />
            <Stat label="Ready" value={String(readyCount)} tone="text-positive" />
            <Stat label="MTD" value={formatCompactMoney(revenueMtd)} />
          </div>

          <div className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-positive opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-positive" />
              </span>
              <h2 className="text-[12px] font-semibold text-ink">Live queue</h2>
              <span className="mono-id text-[11px]">{queue.length} open</span>
            </div>
            <Link
              href="/tickets"
              className="text-[11px] text-ink-tertiary transition-colors hover:text-ink"
            >
              All tickets
            </Link>
          </div>

          <div
            role="listbox"
            aria-label="Live queue"
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                move(1);
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                move(-1);
              }
            }}
            className="fade-y min-h-0 flex-1 overflow-y-auto overscroll-contain"
          >
            {visible.map((ticket, index) => (
              <QueueRow
                key={ticket.id}
                ticket={ticket}
                active={ticket.id === selected?.id}
                rowRef={(node) => {
                  rowRefs.current[index] = node;
                }}
                onSelect={() => {
                  setSelectedId(ticket.id);
                  setMobileView("bench");
                }}
              />
            ))}
            {visibleCount < queue.length ? <div ref={sentinelRef} className="h-px w-full" /> : null}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-hairline px-4 py-2 text-[10px] text-ink-faint">
            <span>↑ ↓ move · click to stage</span>
            {lowStockCount > 0 ? (
              <Link href="/inventory" className="text-warn transition-colors hover:text-warn-ink">
                {lowStockCount} low stock
              </Link>
            ) : (
              <span className="text-ink-faint">stock ok</span>
            )}
          </div>
        </motion.aside>

        {/* The bench */}
        {selected ? (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 30, delay: 0.1 }}
            onPointerMove={trackPointer}
            onPointerLeave={() => {
              pointerX.set(0);
              pointerY.set(0);
            }}
            className={cn(
              "relative min-w-0 flex-1 flex-col lg:flex",
              mobileView === "bench" ? "flex" : "hidden",
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={selected.id}
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                className="flex min-h-0 flex-1 flex-col"
              >
            <header className="flex flex-wrap items-start justify-between gap-3 px-5 pb-1 pt-5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="mono-id text-[11px] text-accent-bright">
                    {selected.ticket_number}
                  </span>
                  <span aria-hidden="true" className="text-ink-faint">
                    /
                  </span>
                  <span className={cn("text-[11px]", TICKET_STATUS_META[selected.status].tone)}>
                    {TICKET_STATUS_META[selected.status].label}
                  </span>
                </div>
                <h2 className="display-tight mt-1 truncate text-[21px] text-ink sm:text-[24px]">
                  {selected.customer.full_name}
                </h2>
                <p className="mt-0.5 truncate text-[12px] text-ink-tertiary">
                  {selected.device.brand} {selected.device.model}
                </p>
                <p className="mt-2 line-clamp-2 max-w-[62ch] text-[12px] leading-5 text-ink-secondary">
                  {selected.issue}
                </p>
              </div>

              <Link
                href={`/tickets/${selected.id}`}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-hairline bg-raised px-3 text-[12px] font-medium text-ink transition-colors hover:bg-overlay"
              >
                Open ticket
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </header>

            <div className="flex flex-wrap gap-2 px-5 pt-3 lg:hidden">
              <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-panel/70 px-3 py-1.5 text-[11px] text-ink-secondary">
                <span className={cn("h-1.5 w-1.5 rounded-full", TICKET_STATUS_META[selected.status].dot)} />
                {TICKET_STATUS_META[selected.status].label}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-panel/70 px-3 py-1.5 text-[11px] text-ink-secondary">
                {selected.assignee?.full_name ?? "Unassigned"}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-panel/70 px-3 py-1.5 text-[11px] text-ink-secondary">
                <span className={cn("h-1.5 w-1.5 rounded-full", PRIORITY_META[selected.priority].dot)} />
                {PRIORITY_META[selected.priority].label}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-panel/70 px-3 py-1.5 font-mono text-[11px] text-ink-secondary">
                {selected.estimate_cents > 0 ? formatMoney(selected.estimate_cents) : "No estimate"}
              </span>
            </div>

            <div className="relative min-h-0 flex-1 overflow-hidden">
              <div aria-hidden="true" className="dot-grid absolute inset-0 opacity-40" />
              <div
                aria-hidden="true"
                className="glow-accent pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2"
              />

              <ExplodedDevice className="relative h-full" pointerX={pointerX} pointerY={pointerY} />

              <FloatPill
                className="left-5 top-4"
                label="Status"
                value={TICKET_STATUS_META[selected.status].label}
                mark={
                  <span
                    className={cn("h-1.5 w-1.5 rounded-full", TICKET_STATUS_META[selected.status].dot)}
                  />
                }
              />
              <FloatPill
                className="right-5 top-10"
                label="Assigned"
                value={selected.assignee?.full_name ?? "Unassigned"}
                mark={
                  <span className="text-[8px] font-semibold uppercase text-ink-tertiary">
                    {initials(selected.assignee?.full_name ?? "PW")}
                  </span>
                }
              />
              <FloatPill
                className="bottom-20 left-8"
                label="Priority"
                value={PRIORITY_META[selected.priority].label}
                mark={
                  <span
                    className={cn("h-1.5 w-1.5 rounded-full", PRIORITY_META[selected.priority].dot)}
                  />
                }
              />
              <FloatPill
                className="bottom-24 right-8"
                label="Estimate"
                value={
                  selected.estimate_cents > 0
                    ? formatMoney(selected.estimate_cents)
                    : "No estimate"
                }
                mark={<span className="text-[10px] font-semibold text-accent-bright">$</span>}
              />
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-2 border-t border-hairline bg-panel/70 px-4 py-3 backdrop-blur-xl">
              <Link
                href={`/tickets/${selected.id}`}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent-fill px-3.5 text-[12px] font-semibold text-white transition duration-150 hover:brightness-110 active:scale-[0.985]"
              >
                <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
                Update status
              </Link>
              <Link
                href={`/tickets/${selected.id}`}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-hairline bg-raised px-3.5 text-[12px] font-medium text-ink transition-colors hover:bg-overlay"
              >
                <Boxes className="h-3.5 w-3.5" aria-hidden="true" />
                Add part
              </Link>
              <Link
                href={`/tickets/${selected.id}`}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-hairline bg-raised px-3.5 text-[12px] font-medium text-ink transition-colors hover:bg-overlay"
              >
                <Receipt className="h-3.5 w-3.5" aria-hidden="true" />
                Create invoice
              </Link>
              <span className="ml-auto hidden font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint xl:block">
                staged · newest first
              </span>
            </div>
            </motion.div>
            </AnimatePresence>
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}
