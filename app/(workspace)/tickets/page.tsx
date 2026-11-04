import type { Metadata } from "next";
import Link from "next/link";

import {
  EmptyState,
  Feedback,
  PageHeader,
  Panel,
  PrimaryLink,
  PriorityPill,
  StatusPill,
} from "@/components/workspace/ui";
import { formatRelative, PRIORITY_META, TICKET_STATUS_META } from "@/lib/repair/format";
import { getStaffProfiles, getTickets } from "@/lib/repair/queries";
import { TICKET_PRIORITIES, TICKET_STATUSES } from "@/lib/repair/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Tickets" };

type SearchParams = Promise<{
  q?: string;
  status?: string;
  priority?: string;
  assigned?: string;
  notice?: string;
  error?: string;
}>;

const FILTER =
  "h-8 w-full rounded border border-line bg-paper px-2.5 text-[13px] text-ink outline-none placeholder:text-muted/60 focus:border-accent";

export default async function TicketsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const [tickets, staff] = await Promise.all([
    getTickets({
      search: params.q,
      status: params.status,
      priority: params.priority,
      assigned: params.assigned,
    }),
    getStaffProfiles(),
  ]);

  const active = Boolean(
    params.q ||
      (params.status && params.status !== "all") ||
      (params.priority && params.priority !== "all") ||
      (params.assigned && params.assigned !== "all"),
  );

  return (
    <div>
      <PageHeader
        title="Tickets"
        description="Every device on the bench, from intake to collection."
        actions={<PrimaryLink href="/tickets/new">New ticket</PrimaryLink>}
      />
      <Feedback notice={params.notice} error={params.error} />

      <Panel className="mt-4">
        <form className="grid gap-2 p-3 lg:grid-cols-[1.6fr_0.9fr_0.8fr_1fr_auto]">
          <label>
            <span className="sr-only">Search tickets</span>
            <input
              name="q"
              defaultValue={params.q}
              placeholder="Search ticket, customer, phone, device"
              className={FILTER}
            />
          </label>
          <label>
            <span className="sr-only">Status</span>
            <select name="status" defaultValue={params.status ?? "all"} className={FILTER}>
              <option value="all">All statuses</option>
              {TICKET_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {TICKET_STATUS_META[status].label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Priority</span>
            <select name="priority" defaultValue={params.priority ?? "all"} className={FILTER}>
              <option value="all">All priorities</option>
              {TICKET_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {PRIORITY_META[priority].label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Technician</span>
            <select name="assigned" defaultValue={params.assigned ?? "all"} className={FILTER}>
              <option value="all">Any technician</option>
              {staff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.full_name || member.email}
                </option>
              ))}
            </select>
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex h-8 items-center justify-center rounded bg-wash px-3 text-[13px] font-medium text-ink transition-colors hover:bg-line"
            >
              Filter
            </button>
            {active ? (
              <Link
                href="/tickets"
                className="inline-flex h-8 items-center justify-center rounded px-2.5 text-[13px] text-muted transition-colors hover:text-ink"
              >
                Clear
              </Link>
            ) : null}
          </div>
        </form>

        {tickets.length === 0 ? (
          <div className="px-3 pb-3">
            <EmptyState
              title={active ? "No matching tickets" : "No tickets yet"}
              body={
                active
                  ? "Change the filters or search term and try again."
                  : "Log the first device and Patchwork will start building the queue."
              }
              action={<PrimaryLink href="/tickets/new">New ticket</PrimaryLink>}
            />
          </div>
        ) : (
          <>
            <div className="hidden grid-cols-[6.5rem_1fr_1.2fr_8rem_6rem_7rem_5rem] gap-3 px-3 pb-1.5 text-[11.5px] text-muted lg:grid">
              <span>Ticket</span>
              <span>Customer</span>
              <span>Issue</span>
              <span>Status</span>
              <span>Priority</span>
              <span>Technician</span>
              <span className="text-right">Updated</span>
            </div>
            <ul className="pb-2">
              {tickets.map((ticket) => (
                <li key={ticket.id}>
                  <Link
                    href={`/tickets/${ticket.id}`}
                    className="grid gap-1 px-3 py-2.5 transition-colors hover:bg-wash/40 lg:grid-cols-[6.5rem_1fr_1.2fr_8rem_6rem_7rem_5rem] lg:items-center lg:gap-3"
                  >
                    <span>
                      <span className="figure block text-[12.5px] text-ink">{ticket.ticket_number}</span>
                      <span className="figure mt-0.5 block text-[11.5px] text-muted">
                        {ticket.public_code}
                      </span>
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium text-ink">
                        {ticket.customer.full_name}
                      </span>
                      <span className="mt-0.5 block truncate text-[12px] text-muted">
                        {ticket.device.brand} {ticket.device.model}
                      </span>
                    </span>
                    <span className="line-clamp-2 text-[12.5px] leading-5 text-muted">
                      {ticket.issue}
                    </span>
                    <StatusPill status={ticket.status} />
                    <PriorityPill priority={ticket.priority} />
                    <span className="truncate text-[12.5px] text-ink">
                      {ticket.assignee?.full_name || <span className="text-muted">Unassigned</span>}
                    </span>
                    <span className="figure text-[12px] text-muted lg:text-right">
                      {formatRelative(ticket.updated_at)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </Panel>

      <p className="mt-3 text-[12.5px] text-muted">
        {tickets.length} ticket{tickets.length === 1 ? "" : "s"} shown.
      </p>
    </div>
  );
}
