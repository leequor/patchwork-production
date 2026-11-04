import type { Metadata } from "next";
import Link from "next/link";

import {
  DataBar,
  EmptyState,
  PageHeader,
  Panel,
  PanelHeader,
  PrimaryLink,
  SecondaryLink,
  StatusPill,
} from "@/components/workspace/ui";
import { formatCompactMoney, formatRelative, ROLE_LABELS } from "@/lib/repair/format";
import { getDashboardData } from "@/lib/repair/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Repair desk" };

const STAGES = ["intake", "diagnosing", "waiting_parts", "in_repair"] as const;

export default async function DashboardPage() {
  const data = await getDashboardData();
  const dateLabel = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div>
      <PageHeader
        title="Repair desk"
        description={dateLabel}
        actions={
          <>
            <SecondaryLink href="/track">Open tracker</SecondaryLink>
            <PrimaryLink href="/tickets/new">New ticket</PrimaryLink>
          </>
        }
      />

      <section aria-label="Tickets by stage" className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STAGES.map((status) => (
          <Link
            key={status}
            href={`/tickets?status=${status}`}
            className="flex items-baseline justify-between gap-3 rounded bg-surface px-3.5 py-3 transition-colors hover:bg-raised"
          >
            <StatusPill status={status} />
            <span className="figure text-[26px] font-semibold leading-none tracking-[-0.03em] text-ink">
              {data.counts[status]}
            </span>
          </Link>
        ))}
      </section>

      <div className="mt-3 grid gap-3 xl:grid-cols-[1.5fr_0.5fr]">
        <Panel className="overflow-hidden">
          <PanelHeader
            title="Live queue"
            detail={`${data.queue.length} open · newest first`}
            action={
              <Link href="/tickets" className="text-[13px] text-muted transition-colors hover:text-ink">
                All tickets
              </Link>
            }
          />

          {data.queue.length === 0 ? (
            <div className="px-4 pb-4">
              <EmptyState
                title="The bench is clear"
                body="Create the first ticket when a device comes in."
                action={<PrimaryLink href="/tickets/new">New ticket</PrimaryLink>}
              />
            </div>
          ) : (
            <>
              <div className="hidden grid-cols-[6rem_1fr_9rem_8.5rem_5rem] gap-3 px-4 pb-1.5 text-[11.5px] text-muted lg:grid">
                <span>Ticket</span>
                <span>Customer and device</span>
                <span>Issue</span>
                <span>Status</span>
                <span className="text-right">Age</span>
              </div>
              <ul>
                {data.queue.map((ticket) => (
                  <li key={ticket.id}>
                    <Link
                      href={`/tickets/${ticket.id}`}
                      className="grid gap-1 px-4 py-2.5 transition-colors hover:bg-wash/40 lg:grid-cols-[6rem_1fr_9rem_8.5rem_5rem] lg:items-center lg:gap-3"
                    >
                      <span className="figure text-[12.5px] text-muted">{ticket.ticket_number}</span>
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium text-ink">
                          {ticket.customer.full_name}
                        </span>
                        <span className="mt-0.5 block truncate text-[12px] text-muted">
                          {ticket.device.brand} {ticket.device.model}
                        </span>
                      </span>
                      <span className="truncate text-[12.5px] text-muted">{ticket.issue}</span>
                      <StatusPill status={ticket.status} />
                      <span className="figure text-[12px] text-muted lg:text-right">
                        {formatRelative(ticket.created_at)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Panel>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <Panel className="px-4 py-4">
            <h2 className="text-[14px] font-semibold text-ink">Today</h2>
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-4">
              <div>
                <dt className="text-[12px] text-muted">Open jobs</dt>
                <dd className="figure mt-0.5 text-[22px] font-semibold leading-none tracking-[-0.03em] text-ink">
                  {data.openCount}
                </dd>
              </div>
              <div>
                <dt className="text-[12px] text-muted">Ready to collect</dt>
                <dd className="figure mt-0.5 text-[22px] font-semibold leading-none tracking-[-0.03em] text-positive">
                  {data.readyCount}
                </dd>
              </div>
              <div>
                <dt className="text-[12px] text-muted">Paid this month</dt>
                <dd className="figure mt-0.5 text-[22px] font-semibold leading-none tracking-[-0.03em] text-ink">
                  {formatCompactMoney(data.revenueMtd)}
                </dd>
              </div>
              <div>
                <dt className="text-[12px] text-muted">Low stock</dt>
                <dd className="figure mt-0.5 text-[22px] font-semibold leading-none tracking-[-0.03em] text-warn">
                  {data.lowStock.length}
                </dd>
              </div>
            </dl>
            <div className="mt-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[12px] text-muted">Next out the door</p>
                <Link
                  href="/tickets?status=ready"
                  className="text-[12.5px] text-muted transition-colors hover:text-ink"
                >
                  View ready
                </Link>
              </div>
              <ul className="mt-2 space-y-1">
                {data.readyTickets.slice(0, 2).map((ticket) => (
                  <li key={ticket.id}>
                    <Link
                      href={`/tickets/${ticket.id}`}
                      className="flex items-baseline justify-between gap-2 rounded px-2 py-1.5 transition-colors hover:bg-wash/50"
                    >
                      <span className="min-w-0 truncate text-[13px] text-ink">
                        {ticket.customer.full_name}
                      </span>
                      <span className="figure shrink-0 text-[11.5px] text-muted">
                        {ticket.ticket_number}
                      </span>
                    </Link>
                  </li>
                ))}
                {data.readyTickets.length === 0 ? (
                  <li className="px-2 py-1.5 text-[12.5px] text-muted">Nothing waiting for pickup.</li>
                ) : null}
              </ul>
            </div>
          </Panel>

          <Panel className="px-4 py-4">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-[14px] font-semibold text-ink">Bench load</h2>
              <span className="text-[12px] text-muted">open jobs</span>
            </div>
            <div className="mt-3 space-y-3">
              {data.teamLoad.length === 0 ? (
                <p className="text-[12.5px] text-muted">No staff profiles yet.</p>
              ) : (
                data.teamLoad.slice(0, 5).map((member) => (
                  <div key={member.id}>
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="min-w-0 truncate text-[13px] text-ink">
                        {member.full_name || member.email}
                      </p>
                      <span className="figure text-[13px] text-ink">{member.open}</span>
                    </div>
                    <p className="mt-0.5 text-[11.5px] text-muted">{ROLE_LABELS[member.role]}</p>
                    <div className="mt-1.5">
                      <DataBar value={member.open} max={Math.max(1, data.openCount)} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Panel>
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Panel className="px-4 py-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[14px] font-semibold text-ink">Low stock</h2>
            <Link href="/inventory" className="text-[12.5px] text-muted transition-colors hover:text-ink">
              Inventory
            </Link>
          </div>
          {data.lowStock.length === 0 ? (
            <p className="mt-3 text-[12.5px] text-muted">Stock levels are healthy.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {data.lowStock.slice(0, 4).map((part) => (
                <li key={part.id} className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] text-ink">{part.name}</span>
                    <span className="mt-0.5 block text-[11.5px] text-muted">{part.sku}</span>
                  </span>
                  <span
                    className={
                      part.stock === 0
                        ? "figure shrink-0 text-[12.5px] text-negative"
                        : "figure shrink-0 text-[12.5px] text-warn"
                    }
                  >
                    {part.stock} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel className="px-4 py-4">
          <h2 className="text-[14px] font-semibold text-ink">Shop totals</h2>
          <dl className="mt-3 space-y-2 text-[13px]">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted">Tickets on the bench</dt>
              <dd className="figure text-ink">{data.openCount}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted">Waiting on customers</dt>
              <dd className="figure text-ink">{data.readyCount}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted">Staff on shift</dt>
              <dd className="figure text-ink">{data.teamLoad.length}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted">Stock alerts</dt>
              <dd className="figure text-ink">{data.lowStock.length}</dd>
            </div>
          </dl>
        </Panel>
      </div>
    </div>
  );
}
