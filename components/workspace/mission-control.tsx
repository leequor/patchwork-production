"use client";

import { ArrowUpRight, Boxes, Receipt, Wrench } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { DeviceStageMount } from "@/components/three/device-stage-mount";
import { formForCategory } from "@/lib/device-form";
import { previewHref } from "@/lib/preview/navigation";
import { RelativeTime } from "@/components/ui/relative-time";
import {
  PRIORITY_META,
  TICKET_STATUS_META,
  formatCompactMoney,
  formatMoney,
} from "@/lib/repair/format";
import type { TicketRow } from "@/lib/repair/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="min-w-0 border-l border-hairline-strong pl-3 sm:pl-5">
      <dt className="text-xs text-ink-secondary">{label}</dt>
      <dd className={cn("figure mt-1 text-[clamp(18px,2vw,28px)] leading-none text-ink", tone)}>{value}</dd>
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
      tabIndex={active ? 0 : -1}
      onClick={onSelect}
      className={cn(
        "group relative flex w-full items-start gap-3 border-b border-hairline/60 px-4 py-3 text-left transition-colors duration-150 focus-visible:-outline-offset-2",
        active ? "bg-overlay" : "hover:bg-raised/50",
      )}
    >
      {active ? (
        <span
          aria-hidden="true"
          className="absolute inset-y-2 left-0 w-[2px] bg-accent"
        />
      ) : null}

      <span className={cn("mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full", priority.dot)} aria-hidden="true" />

      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-semibold text-ink">
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
          <span className="truncate text-xs text-ink-secondary">
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
  preview = false,
}: {
  queue: TicketRow[];
  openCount: number;
  readyCount: number;
  revenueMtd: number;
  lowStockCount: number;
  preview?: boolean;
}) {
  const route = (href: string) => (preview ? previewHref(href) : href);
  const [selectedId, setSelectedId] = useState<string | null>(queue[0]?.id ?? null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [mobileView, setMobileView] = useState<"queue" | "bench">("queue");
  const sentinelRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Array<HTMLButtonElement | null>>([]);

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

  const move = (delta: number) => {
    if (!selected) return;
    const index = visible.findIndex((ticket) => ticket.id === selected.id);
    const next = Math.min(visible.length - 1, Math.max(0, index + delta));
    const target = visible[next];
    if (!target) return;
    setSelectedId(target.id);
    rowRefs.current[next]?.focus();
  };

  const overview = (
    <header className="mb-3 flex shrink-0 flex-wrap items-end justify-between gap-x-8 gap-y-3 px-1 py-2 sm:mb-4 sm:py-4">
      <h1 className="display-tight text-[clamp(26px,3.2vw,44px)] text-ink">Mission control</h1>
      <dl aria-label="Shop overview" className="grid w-full grid-cols-3 sm:w-auto sm:min-w-[310px]">
        <Stat label="Open" value={String(openCount)} />
        <Stat label="Ready" value={String(readyCount)} tone="text-positive" />
        <Stat label="MTD" value={formatCompactMoney(revenueMtd)} />
      </dl>
    </header>
  );

  if (queue.length === 0) {
    return (
      <section className="flex h-full min-h-0 flex-col">
        {overview}
        <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl bg-panel/40 ring-1 ring-inset ring-white/[0.06] p-8 text-center">
          <h2 className="display text-[28px] text-ink">The bench is clear</h2>
          <p className="max-w-[46ch] text-[13px] leading-6 text-ink-secondary">
            No devices are waiting. Take the first intake and it lands in the live queue immediately.
          </p>
          <Link
            href={route("/tickets/new")}
            className="primary inline-flex h-10 items-center gap-2 rounded-sm px-4 text-[13px] font-semibold transition hover:brightness-105"
          >
            New intake
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-full min-h-0 flex-col">
      {overview}

      <div className="mb-3 flex gap-1 rounded-sm bg-panel ring-1 ring-inset ring-white/[0.06] p-1 lg:hidden">
        {(["queue", "bench"] as const).map((view) => (
          <button
            key={view}
            type="button"
            aria-pressed={mobileView === view}
            onClick={() => setMobileView(view)}
            className={cn(
               "h-10 flex-1 rounded-sm text-sm font-medium capitalize transition-colors",
              mobileView === view ? "bg-raised text-ink" : "text-ink-tertiary",
            )}
          >
            {view}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 gap-3 lg:gap-4">
        {/* The queue */}
        <aside
          className={cn(
            "min-w-0 flex-col overflow-hidden rounded-md bg-panel lg:flex lg:w-[33%] lg:min-w-[290px] lg:max-w-[420px]",
            mobileView === "queue" ? "flex w-full" : "hidden",
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-hairline bg-raised px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-positive opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-positive" />
              </span>
              <h2 className="text-base font-semibold text-ink">Live queue</h2>
              <span className="mono-id">{queue.length}</span>
            </div>
            <Link
              href={route("/tickets")}
              className="tap text-xs text-ink-secondary transition-colors hover:text-ink"
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
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
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

          <div className="flex items-center justify-between gap-3 border-t border-hairline px-4 py-2.5 font-mono text-[10px] text-ink-tertiary">
            <span className="hidden lg:inline">↑ ↓ select a repair</span><span className="lg:hidden">Select a repair</span>
            {lowStockCount > 0 ? (
              <Link href={route("/inventory")} className="text-warn transition-colors hover:text-warn-ink">
                {lowStockCount} low stock
              </Link>
            ) : (
              <span className="text-ink-faint">stock ok</span>
            )}
          </div>
        </aside>

        {/* The bench */}
        {selected ? (
          <div
            className={cn(
              "relative min-w-0 flex-1 flex-col overflow-y-auto rounded-md bg-panel lg:flex",
              mobileView === "bench" ? "flex" : "hidden",
            )}
          >
            <header className="flex flex-wrap items-start justify-between gap-3 px-4 pb-4 pt-5 sm:px-6">
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
                <h2 className="display-tight mt-2 break-words text-[clamp(22px,2.8vw,38px)] text-ink">
                  {selected.device.brand} {selected.device.model}
                </h2>
                <p className="mt-1 break-words text-sm text-ink-secondary">
                  {selected.customer.full_name}
                </p>
                <p className="mt-2 line-clamp-2 max-w-[62ch] text-sm leading-5 text-ink-secondary">
                  {selected.issue}
                </p>
              </div>

              <Link
                href={route(`/tickets/${selected.id}`)}
                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-sm bg-raised ring-1 ring-inset ring-white/[0.08] px-2.5 text-[12px] font-medium text-ink transition-colors hover:ring-white/[0.16] hover:bg-overlay"
              >
                Open ticket
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </header>

            <div className="plate-ground relative min-h-[155px] flex-1 overflow-hidden sm:min-h-[200px]">
              <div className="iris" />
              <div className="absolute inset-0">
                <DeviceStageMount
                  status={selected.status}
                  form={formForCategory(selected.device.category)}
                  className="h-full px-2 pb-5 pt-2"
                  caption={`bench · ${TICKET_STATUS_META[selected.status].label}`}
                />
              </div>
            </div>

            <dl className="grid grid-cols-[1.2fr_.8fr_1fr] gap-3 bg-raised px-4 py-3 text-sm sm:px-6">
              <div>
                <dt className="text-xs text-ink-tertiary">Assigned</dt>
                <dd className="mt-1 break-words">{selected.assignee?.full_name ?? "Unassigned"}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-tertiary">Priority</dt>
                <dd className={cn("mt-1", PRIORITY_META[selected.priority].tone)}>{PRIORITY_META[selected.priority].label}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-tertiary">Estimate</dt>
                <dd className="mt-1 break-words tabular-nums">{selected.estimate_cents > 0 ? formatMoney(selected.estimate_cents) : "No estimate"}</dd>
              </div>
            </dl>

            <div className="relative z-10 flex flex-wrap items-center gap-2 border-t border-hairline bg-panel px-4 py-3">
              <Link
                href={route(`/tickets/${selected.id}`)}
                className="primary inline-flex h-8 items-center gap-2 rounded-sm px-3 text-[12px] font-semibold transition duration-150 hover:brightness-105 active:translate-y-px"
              >
                <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
                Update status
              </Link>
              <Link
                href={route(`/tickets/${selected.id}`)}
                className="inline-flex h-8 items-center gap-2 rounded-sm bg-raised ring-1 ring-inset ring-white/[0.08] px-3 text-[12px] font-medium text-ink transition-colors hover:ring-white/[0.16] hover:bg-overlay"
              >
                <Boxes className="h-3.5 w-3.5" aria-hidden="true" />
                Add part
              </Link>
              <Link
                href={route(`/tickets/${selected.id}`)}
                className="inline-flex h-8 items-center gap-2 rounded-sm bg-raised ring-1 ring-inset ring-white/[0.08] px-3 text-[12px] font-medium text-ink transition-colors hover:ring-white/[0.16] hover:bg-overlay"
              >
                <Receipt className="h-3.5 w-3.5" aria-hidden="true" />
                Create invoice
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
