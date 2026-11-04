import Link from "next/link";
import type { ReactNode } from "react";

import { INVOICE_STATUS_META, PRIORITY_META, TICKET_STATUS_META } from "@/lib/repair/format";
import type { InvoiceStatus, TicketPriority, TicketStatus } from "@/lib/repair/types";
import { cn } from "@/lib/utils";

function Mark({ className }: { className: string }) {
  return <span className={cn("h-2 w-2 shrink-0", className)} aria-hidden="true" />;
}

/**
 * Status is a printed mark and a word. The word carries the meaning; the square
 * is the second, quieter signal. A bench board is scanned, not read.
 */
export function StatusPill({ status, className }: { status: TicketStatus; className?: string }) {
  const meta = TICKET_STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-2 font-sans text-[13px] font-medium",
        meta.tone,
        className,
      )}
    >
      <Mark className={meta.dot} />
      {meta.label}
    </span>
  );
}

export function PriorityPill({ priority, className }: { priority: TicketPriority; className?: string }) {
  const meta = PRIORITY_META[priority];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-2 font-sans text-[13px]",
        meta.tone,
        className,
      )}
    >
      <Mark className={meta.dot} />
      {meta.label}
    </span>
  );
}

export function InvoicePill({ status, className }: { status: InvoiceStatus; className?: string }) {
  const meta = INVOICE_STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-2 font-sans text-[13px]",
        meta.tone,
        className,
      )}
    >
      <Mark className={meta.dot} />
      {meta.label}
    </span>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0">
        <h1 className="display text-[30px] text-ink sm:text-[34px]">{title}</h1>
        {description ? (
          <p className="mt-1.5 max-w-[62ch] font-sans text-[15px] leading-6 text-ink-secondary">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Feedback({ notice, error }: { notice?: string; error?: string }) {
  if (!notice && !error) return null;
  return (
    <div
      className={cn(
        "mt-4 rounded-lg px-3.5 py-2.5 font-sans text-[13px] leading-5",
        error ? "bg-negative-soft text-negative-ink" : "bg-positive-soft text-positive-ink",
      )}
      role={error ? "alert" : "status"}
    >
      {error || notice}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-hairline bg-canvas/40 px-6 py-10">
      <p className="font-sans text-[15px] font-semibold text-ink">{title}</p>
      <p className="mt-1.5 max-w-[52ch] font-sans text-[14px] leading-6 text-ink-secondary">{body}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

const LINK_BASE =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-3.5 font-sans text-[13px] font-semibold transition-[background-color,filter,transform] duration-150 active:scale-[0.985]";

export function SecondaryLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        LINK_BASE,
        "border border-hairline bg-raised text-ink hover:bg-overlay",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function PrimaryLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(LINK_BASE, "bg-accent-fill text-white hover:brightness-110", className)}
    >
      {children}
    </Link>
  );
}

/** Panels separate by a step in tone, not by an outline. */
export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-hairline bg-panel", className)}>{children}</div>
  );
}

export function PanelHeader({
  title,
  detail,
  action,
}: {
  title: string;
  detail?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 px-4 pb-3 pt-4">
      <div className="min-w-0">
        <h2 className="font-sans text-[15px] font-semibold text-ink">{title}</h2>
        {detail ? (
          <p className="mt-0.5 font-sans text-[13px] leading-5 text-ink-secondary">{detail}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function DataBar({
  value,
  max,
  tone = "bg-accent",
}: {
  value: number;
  max: number;
  tone?: string;
}) {
  const width = max <= 0 ? 0 : Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  return (
    <div className="h-1.5 w-full overflow-hidden bg-overlay">
      <div className={cn("h-full", tone)} style={{ width: `${width}%` }} />
    </div>
  );
}
