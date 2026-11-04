import Link from "next/link";
import type { ReactNode } from "react";

import { INVOICE_STATUS_META, PRIORITY_META, TICKET_STATUS_META } from "@/lib/repair/format";
import type { InvoiceStatus, TicketPriority, TicketStatus } from "@/lib/repair/types";
import { cn } from "@/lib/utils";

function Dot({ className }: { className: string }) {
  return <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", className)} aria-hidden="true" />;
}

/**
 * Status is a dot and a word. The word carries the meaning; the dot is a
 * second, quiet signal. No fills, no pills — a bench board is scanned, not read.
 */
export function StatusPill({ status, className }: { status: TicketStatus; className?: string }) {
  const meta = TICKET_STATUS_META[status];
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1.5 text-[13px]", meta.tone, className)}>
      <Dot className={meta.dot} />
      {meta.label}
    </span>
  );
}

export function PriorityPill({ priority, className }: { priority: TicketPriority; className?: string }) {
  const meta = PRIORITY_META[priority];
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1.5 text-[12.5px]", meta.tone, className)}>
      <Dot className={meta.dot} />
      {meta.label}
    </span>
  );
}

export function InvoicePill({ status, className }: { status: InvoiceStatus; className?: string }) {
  const meta = INVOICE_STATUS_META[status];
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1.5 text-[13px]", meta.tone, className)}>
      <Dot className={meta.dot} />
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
        <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.015em] text-ink">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-[74ch] text-[13px] leading-5 text-muted">{description}</p>
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
        "mt-4 rounded px-3 py-2.5 text-[13px] leading-5",
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
    <div className="rounded bg-paper px-6 py-10">
      <p className="text-[13.5px] font-medium text-ink">{title}</p>
      <p className="mt-1.5 max-w-[52ch] text-[13px] leading-5 text-muted">{body}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

const LINK_BASE =
  "inline-flex h-8 items-center justify-center rounded px-3 text-[13px] font-medium transition-colors";

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
    <Link href={href} className={cn(LINK_BASE, "bg-wash text-ink hover:bg-line", className)}>
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
      className={cn(LINK_BASE, "bg-accent font-semibold text-paper hover:bg-gold", className)}
    >
      {children}
    </Link>
  );
}

/** Panels separate by tone, not by outline. One ground step is enough. */
export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded bg-surface", className)}>{children}</div>;
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
        <h2 className="text-[14px] font-semibold text-ink">{title}</h2>
        {detail ? <p className="mt-0.5 text-[12.5px] leading-4 text-muted">{detail}</p> : null}
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
    <div className="h-1 w-full overflow-hidden rounded-none bg-wash">
      <div className={cn("h-full", tone)} style={{ width: `${width}%` }} />
    </div>
  );
}
