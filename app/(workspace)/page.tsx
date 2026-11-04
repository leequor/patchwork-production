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
import {
  formatCompactMoney,
  formatRelative,
  ROLE_LABELS,
  TICKET_STATUS_META,
} from "@/lib/repair/format";
import { getDashboardData } from "@/lib/repair/queries";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Repair desk" };

const STAGES = ["intake", "diagnosing", "waiting_parts", "in_repair", "ready"] as const;

const STAGE_BAR: Record<(typeof STAGES)[number], string> = {
  intake: "bg-steel",
  diagnosing: "bg-info",
  waiting_parts: "bg-warn",
  in_repair: "bg-accent",
  ready: "bg-positive",
};

export default async function DashboardPage() {
  const data = await getDashboardData();
  const dateLabel = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-3">
      <PageHeader
        title="Repair desk"
        description={`${dateLabel} · ${data.openCount} open on the bench, ${data.readyCount} waiting for pickup.`}
        actions={
          <>
            <SecondaryLink href="/track">Open tracker</SecondaryLink>
            <PrimaryLink href="/tickets/new">New ticket</PrimaryLink>
          </>
        }
      />

      <section aria-label="Tickets by stage" className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {STAGES.map((status) => (
          <Link
            key={status}
            href={`/tickets?status=${status}`}
            className="group rounded-sm bg-surface p-4 transition-colors duration-150 hover:bg-raised"
          >
            <span aria-hidden="true" className={cn("block h-[3px] w-8", STAGE_BAR[status])} />
            <span className="figure mt-3 block text-[34px] font-bold leading-none tracking-[-0.04em] text-ink">
              {data.counts[status]}
            </span>
            <span className="mt-2 block font-sans text-[13px] text-muted transition-colors group-hover:text-ink">
              {TICKET_STATUS_META[status].label}
            </span>
          </Link>
        ))}
      </section>

      <div className="grid gap-3 xl:grid-cols-[1.62fr_1fr]">
        <Panel className="overflow-hidden">
          <PanelHeader
            title="Live queue"
            detail={`${data.queue.length} open · newest first`}
            action={
              <Link
                href="/tickets"
                className="font-sans text-[13px] font-semibold text-muted underline underline-offset-4 transition-colors hover:text-ink"
              >
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
            <table className="w-full table-fixed border-collapse text-left">
              <thead>
                <tr className="font-sans text-[13px] text-muted">
                  <th scope="col" className="w-[6rem] px-4 pb-2 font-normal">
                    Ticket
                  </th>
                  <th scope="col" className="px-2 pb-2 font-normal">
                    Customer and device
                  </th>
                  <th scope="col" className="hidden w-[9rem] px-2 pb-2 font-normal md:table-cell">
                    Status
                  </th>
                  <th scope="col" className="w-[6.5rem] px-4 pb-2 text-right font-normal">
                    Age
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.queue.map((ticket) => (
                  <tr key={ticket.id} className="group border-t border-line/70">
                    <td className="px-4 py-3 align-top">
                      <Link href={`/tickets/${ticket.id}`} className="figure text-[13px] text-ink">
                        {ticket.ticket_number}
                      </Link>
                    </td>
                    <td className="px-2 py-3">
                      <Link href={`/tickets/${ticket.id}`} className="block">
                        <span className="block truncate font-sans text-[14px] font-semibold text-ink group-hover:text-accent">
                          {ticket.customer.full_name}
                        </span>
                        <span className="mt-0.5 block truncate font-serif text-[13px] text-muted">
                          {ticket.device.brand} {ticket.device.model} · {ticket.issue}
                        </span>
                      </Link>
                    </td>
                    <td className="hidden whitespace-nowrap px-2 py-3 md:table-cell">
                      <StatusPill status={ticket.status} />
                    </td>
                    <td className="px-4 py-3 text-right align-top">
                      <span className="figure whitespace-nowrap text-[13px] text-muted">
                        {formatRelative(ticket.created_at)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>

        <div className="grid content-start gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <Panel className="p-5">
            <h2 className="font-sans text-[15px] font-semibold text-ink">Today</h2>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5">
              <div>
                <dd className="figure text-[38px] font-bold leading-none tracking-[-0.04em] text-ink">
                  {data.openCount}
                </dd>
                <dt className="mt-1.5 font-sans text-[13px] text-muted">Open jobs</dt>
              </div>
              <div>
                <dd className="figure text-[38px] font-bold leading-none tracking-[-0.04em] text-positive">
                  {data.readyCount}
                </dd>
                <dt className="mt-1.5 font-sans text-[13px] text-muted">Ready to collect</dt>
              </div>
              <div>
                <dd className="figure text-[38px] font-bold leading-none tracking-[-0.04em] text-ink">
                  {formatCompactMoney(data.revenueMtd)}
                </dd>
                <dt className="mt-1.5 font-sans text-[13px] text-muted">Paid this month</dt>
              </div>
              <div>
                <dd className="figure text-[38px] font-bold leading-none tracking-[-0.04em] text-warn">
                  {data.lowStock.length}
                </dd>
                <dt className="mt-1.5 font-sans text-[13px] text-muted">Low stock lines</dt>
              </div>
            </dl>
          </Panel>

          <Panel className="p-5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-sans text-[15px] font-semibold text-ink">Bench load</h2>
              <span className="font-sans text-[13px] text-muted">open jobs</span>
            </div>
            <div className="mt-4 space-y-4">
              {data.teamLoad.length === 0 ? (
                <p className="font-serif text-[14px] text-muted">No staff profiles yet.</p>
              ) : (
                data.teamLoad.slice(0, 5).map((member) => (
                  <div key={member.id}>
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="min-w-0 truncate font-sans text-[13px] font-medium text-ink">
                        {member.full_name || member.email}
                      </p>
                      <span className="figure text-[13px] text-ink">{member.open}</span>
                    </div>
                    <p className="mt-0.5 font-sans text-[13px] text-muted">
                      {ROLE_LABELS[member.role]}
                    </p>
                    <div className="mt-2">
                      <DataBar value={member.open} max={Math.max(1, data.openCount)} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Panel>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_1fr_0.9fr]">
        <Panel className="p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-sans text-[15px] font-semibold text-ink">Next out the door</h2>
            <Link
              href="/tickets?status=ready"
              className="font-sans text-[13px] font-semibold text-muted underline underline-offset-4 hover:text-ink"
            >
              View ready
            </Link>
          </div>
          <ul className="mt-3">
            {data.readyTickets.slice(0, 3).map((ticket) => (
              <li key={ticket.id} className="border-t border-line/70 first:border-t-0">
                <Link
                  href={`/tickets/${ticket.id}`}
                  className="flex items-baseline justify-between gap-3 py-2.5 transition-colors hover:text-accent"
                >
                  <span className="min-w-0 truncate font-sans text-[14px] text-ink">
                    {ticket.customer.full_name}
                  </span>
                  <span className="figure shrink-0 text-[13px] text-muted">
                    {ticket.ticket_number}
                  </span>
                </Link>
              </li>
            ))}
            {data.readyTickets.length === 0 ? (
              <li className="py-2 font-serif text-[14px] text-muted">Nothing waiting for pickup.</li>
            ) : null}
          </ul>
        </Panel>

        <Panel className="p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-sans text-[15px] font-semibold text-ink">Low stock</h2>
            <Link
              href="/inventory"
              className="font-sans text-[13px] font-semibold text-muted underline underline-offset-4 hover:text-ink"
            >
              Inventory
            </Link>
          </div>
          {data.lowStock.length === 0 ? (
            <p className="mt-3 font-serif text-[14px] text-muted">Stock levels are healthy.</p>
          ) : (
            <ul className="mt-3">
              {data.lowStock.slice(0, 4).map((part) => (
                <li
                  key={part.id}
                  className="flex items-baseline justify-between gap-3 border-t border-line/70 py-2.5 first:border-t-0"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-sans text-[14px] text-ink">{part.name}</span>
                    <span className="mt-0.5 block font-serif text-[13px] text-muted">{part.sku}</span>
                  </span>
                  <span
                    className={
                      part.stock === 0
                        ? "figure shrink-0 text-[13px] text-negative"
                        : "figure shrink-0 text-[13px] text-warn"
                    }
                  >
                    {part.stock} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel className="p-5">
          <h2 className="font-sans text-[15px] font-semibold text-ink">Shop totals</h2>
          <dl className="mt-3 font-serif text-[14px]">
            {[
              ["Tickets on the bench", data.openCount],
              ["Waiting on customers", data.readyCount],
              ["Staff on shift", data.teamLoad.length],
              ["Stock alerts", data.lowStock.length],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="flex items-baseline justify-between gap-3 border-t border-line/70 py-2.5 first:border-t-0"
              >
                <dt className="text-muted">{label}</dt>
                <dd className="figure text-[14px] font-semibold text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>
    </div>
  );
}
