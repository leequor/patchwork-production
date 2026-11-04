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
  "h-10 w-full rounded-sm border border-line bg-raised px-2.5 font-sans text-[13px] text-ink outline-none placeholder:text-muted/70 focus:border-accent";

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
        <form className="grid gap-2 p-3 lg:grid-cols-[1.7fr_1fr_0.9fr_1.1fr_auto]">
          <label>
            <span className="sr-only">Search tickets</span>
            <input
              name="q"
              defaultValue={params.q}
              placeholder="Ticket, customer, phone, device"
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
              className="inline-flex h-10 items-center justify-center rounded-sm bg-accent px-3.5 font-sans text-[13px] font-semibold text-onAccent transition-[background-color,transform] duration-150 hover:bg-gold active:scale-[0.98]"
            >
              Filter
            </button>
            {active ? (
              <Link
                href="/tickets"
                className="inline-flex h-10 items-center justify-center rounded-sm px-2.5 font-sans text-[13px] text-muted transition-colors hover:text-ink"
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
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="font-sans text-[13px] text-muted">
                <th scope="col" className="px-4 pb-2 font-normal">
                  Ticket
                </th>
                <th scope="col" className="px-2 pb-2 font-normal">
                  Customer
                </th>
                <th scope="col" className="hidden px-2 pb-2 font-normal xl:table-cell">
                  Issue
                </th>
                <th scope="col" className="px-2 pb-2 font-normal">
                  Status
                </th>
                <th scope="col" className="hidden px-2 pb-2 font-normal lg:table-cell">
                  Priority
                </th>
                <th scope="col" className="hidden px-2 pb-2 font-normal lg:table-cell">
                  Technician
                </th>
                <th scope="col" className="px-4 pb-2 text-right font-normal">
                  Updated
                </th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="group border-t border-line/70">
                  <td className="px-4 py-3 align-top">
                    <Link href={`/tickets/${ticket.id}`} className="block">
                      <span className="figure block text-[13px] font-semibold text-ink group-hover:text-accent">
                        {ticket.ticket_number}
                      </span>
                      <span className="figure mt-0.5 block text-[13px] text-muted">
                        {ticket.public_code}
                      </span>
                    </Link>
                  </td>
                  <td className="px-2 py-3">
                    <Link href={`/tickets/${ticket.id}`} className="block">
                      <span className="block truncate font-sans text-[14px] font-medium text-ink">
                        {ticket.customer.full_name}
                      </span>
                      <span className="mt-0.5 block truncate font-serif text-[13px] text-muted">
                        {ticket.device.brand} {ticket.device.model}
                      </span>
                    </Link>
                  </td>
                  <td className="hidden px-2 py-3 xl:table-cell">
                    <span className="line-clamp-2 max-w-[34ch] font-serif text-[13px] leading-5 text-muted">
                      {ticket.issue}
                    </span>
                  </td>
                  <td className="px-2 py-3">
                    <StatusPill status={ticket.status} />
                  </td>
                  <td className="hidden px-2 py-3 lg:table-cell">
                    <PriorityPill priority={ticket.priority} />
                  </td>
                  <td className="hidden px-2 py-3 lg:table-cell">
                    <span className="font-sans text-[13px] text-ink">
                      {ticket.assignee?.full_name || <span className="text-muted">Unassigned</span>}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right align-top">
                    <span className="figure text-[13px] text-muted">
                      {formatRelative(ticket.updated_at)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <p className="mt-3 font-serif text-[13px] text-muted">
        {tickets.length} ticket{tickets.length === 1 ? "" : "s"} shown.
      </p>
    </div>
  );
}
