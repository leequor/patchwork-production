import Link from "next/link";
import { notFound } from "next/navigation";

import {
  addTicketNoteAction,
  addTicketPartAction,
  createInvoiceAction,
  markInvoicePaidAction,
  updateTicketDetailsAction,
  updateTicketStatusAction,
} from "@/app/actions/repair";
import { FormField } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { CopyButton } from "@/components/workspace/copy-button";
import { SelectField, TextAreaField } from "@/components/workspace/form-controls";
import {
  Feedback,
  InvoicePill,
  Panel,
  PanelHeader,
  PrimaryLink,
  PriorityPill,
  StatusPill,
} from "@/components/workspace/ui";
import {
  DEVICE_CATEGORY_LABELS,
  formatDate,
  formatMoney,
  formatRelative,
  PRIORITY_META,
  TICKET_STATUS_META,
} from "@/lib/repair/format";
import { getInventory, getStaffProfiles, getTicketDetail } from "@/lib/repair/queries";
import { getStaff as getCurrentStaff } from "@/lib/repair/session";
import { TICKET_PRIORITIES, TICKET_STATUSES, type TicketStatus } from "@/lib/repair/types";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string; error?: string }>;
};

export default async function TicketDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const [ticket, staff, parts, currentStaff] = await Promise.all([
    getTicketDetail(id),
    getStaffProfiles(),
    getInventory(),
    getCurrentStaff(),
  ]);

  if (!ticket) notFound();

  const partsTotal = ticket.parts.reduce(
    (total, part) => total + part.quantity * part.unit_price_cents,
    0,
  );
  const subtotal = ticket.labour_cents + partsTotal;
  const tax = Math.round(subtotal * 0.12);
  const total = subtotal + tax;
  const invoice = ticket.invoice;
  const canAddPart = parts.some((part) => part.stock > 0);
  const canManageInvoices = currentStaff?.role !== "user";
  const railStatuses: TicketStatus[] = TICKET_STATUSES.filter((status) => status !== "cancelled");
  const stageIndex = railStatuses.indexOf(ticket.status);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href="/tickets" className="inline-flex items-center gap-1.5 text-[13px] text-ink-secondary transition-colors hover:text-ink">
          <span aria-hidden="true">←</span>
          All tickets
        </Link>
        <div className="flex items-center gap-2">
          <CopyButton value={ticket.public_code} label="Copy code" />
          <PrimaryLink href="/tickets/new">New ticket</PrimaryLink>
        </div>
      </div>

      <Feedback notice={query.notice} error={query.error} />

      <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <h1 className="figure text-[26px] font-semibold leading-none tracking-[-0.03em] text-ink">
              {ticket.ticket_number}
            </h1>
            <StatusPill status={ticket.status} />
            <PriorityPill priority={ticket.priority} />
          </div>
          <p className="mt-2 max-w-[78ch] text-[13px] leading-5 text-ink-secondary">{ticket.issue}</p>
        </div>
        <dl className="flex gap-6 text-[13px] text-ink-secondary">
          <div>
            <dt>Opened</dt>
            <dd className="mt-0.5 text-ink">{formatRelative(ticket.created_at)}</dd>
          </div>
          <div>
            <dt>Tracking</dt>
            <dd className="figure mt-0.5 text-ink">{ticket.public_code}</dd>
          </div>
        </dl>
      </header>

      <ol className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 bg-canvas px-3 py-2" aria-label="Repair stage">
        {railStatuses.map((status, index) => {
          const done = index < stageIndex;
          const current = index === stageIndex;
          return (
            <li key={status} className="flex items-center gap-1.5">
              <span
                className={cn(
                  "h-1.5 w-1.5",
                  current ? "bg-accent" : done ? "bg-ink" : "bg-hairline",
                )}
                aria-hidden="true"
              />
              <span
                className={cn(
                  "text-[13px]",
                  current ? "text-ink" : done ? "text-ink-secondary" : "text-ink-secondary/50",
                )}
                aria-current={current ? "step" : undefined}
              >
                {TICKET_STATUS_META[status].label}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-3 grid gap-3 xl:grid-cols-[1.38fr_0.62fr]">
        <div className="space-y-3">
          <Panel>
            <PanelHeader title="Repair brief" detail="What came in, and what the bench found." />
            <dl className="grid gap-x-6 gap-y-3 px-4 pb-4 sm:grid-cols-2">
              <div>
                <dt className="text-[13px] text-ink-secondary">Customer</dt>
                <dd className="mt-0.5">
                  <Link
                    href={`/customers/${ticket.customer.id}`}
                    className="text-[13px] font-medium text-ink hover:text-accent-deep"
                  >
                    {ticket.customer.full_name}
                  </Link>
                  <span className="mt-0.5 block text-[13px] text-ink-secondary">{ticket.customer.phone}</span>
                  {ticket.customer.email ? (
                    <span className="mt-0.5 block break-all text-[13px] text-ink-secondary">
                      {ticket.customer.email}
                    </span>
                  ) : null}
                </dd>
              </div>
              <div>
                <dt className="text-[13px] text-ink-secondary">Device</dt>
                <dd className="mt-0.5 text-[13px] font-medium text-ink">
                  {ticket.device.brand} {ticket.device.model}
                  <span className="mt-0.5 block text-[13px] font-normal text-ink-secondary">
                    {DEVICE_CATEGORY_LABELS[ticket.device.category] ?? ticket.device.category}
                    {ticket.device.serial ? ` · ${ticket.device.serial}` : ""}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-[13px] text-ink-secondary">Technician</dt>
                <dd className="mt-0.5 text-[13px] text-ink">
                  {ticket.assignee?.full_name || "Unassigned"}
                </dd>
              </div>
              <div>
                <dt className="text-[13px] text-ink-secondary">Target date</dt>
                <dd className="mt-0.5 text-[13px] text-ink">
                  {formatDate(ticket.due_at)}
                  <span className="mt-0.5 block text-[13px] text-ink-secondary">
                    Estimate {formatMoney(ticket.estimate_cents)}
                  </span>
                </dd>
              </div>
            </dl>
            <div className="grid gap-3 border-t border-hairline bg-raised px-4 py-3 sm:grid-cols-2">
              <div>
                <p className="text-[13px] text-ink-secondary">Reported issue</p>
                <p className="mt-1 text-[13px] leading-5 text-ink">{ticket.issue}</p>
              </div>
              <div>
                <p className="text-[13px] text-ink-secondary">Diagnosis</p>
                <p className="mt-1 text-[13px] leading-5 text-ink-secondary">
                  {ticket.diagnosis || "No diagnosis recorded yet."}
                </p>
              </div>
            </div>
          </Panel>

          <Panel>
            <PanelHeader
              title="Parts"
              detail={`${ticket.parts.length} on this repair · ${formatMoney(partsTotal)}`}
            />
            {ticket.parts.length === 0 ? (
              <p className="px-4 pb-3 text-[13px] text-ink-secondary">No parts attached yet.</p>
            ) : (
              <ul className="pb-1">
                {ticket.parts.map((part) => (
                  <li key={part.part.id} className="flex items-center justify-between gap-4 px-4 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] text-ink">{part.part.name}</p>
                      <p className="mt-0.5 text-[13px] text-ink-secondary">
                        {part.part.sku} · {part.quantity} × {formatMoney(part.unit_price_cents)}
                      </p>
                    </div>
                    <p className="figure shrink-0 text-[13px] text-ink">
                      {formatMoney(part.quantity * part.unit_price_cents)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <form action={addTicketPartAction} className="grid gap-3 border-t border-hairline bg-raised px-4 py-3 sm:grid-cols-[1fr_84px_auto] sm:items-end">
              <input type="hidden" name="ticket_id" value={ticket.id} />
              <SelectField id="part_id" name="part_id" label="Add a part" defaultValue="">
                <option value="">Choose inventory part</option>
                {parts.map((part) => (
                  <option key={part.id} value={part.id} disabled={part.stock < 1}>
                    {part.name} · {part.stock} in stock · {formatMoney(part.price_cents)}
                  </option>
                ))}
              </SelectField>
              <FormField id="quantity" name="quantity" type="number" min={1} defaultValue={1} label="Qty" />
              <SubmitButton pendingText="Adding...">Add part</SubmitButton>
            </form>
            {!canAddPart ? (
              <p className="px-4 py-2 text-[13px] text-warn">
                No parts have stock. Restock from the inventory page first.
              </p>
            ) : null}
          </Panel>

          <Panel>
            <PanelHeader title="Timeline" detail="Every status change and note, newest first." />
            <ol className="pb-1">
              {ticket.events.length === 0 ? (
                <li className="px-4 pb-3 text-[13px] text-ink-secondary">No activity recorded.</li>
              ) : (
                ticket.events.map((event) => (
                  <li key={event.id} className="flex gap-2.5 px-4 py-2.5">
                    <span className="mt-1.5 h-1 w-1 shrink-0 bg-raised/60" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
                        <span className="text-[13px] text-ink">{event.actor?.full_name || "System"}</span>
                        {event.status ? <StatusPill status={event.status} /> : null}
                        <span className="text-ink-secondary">{formatRelative(event.created_at)}</span>
                        {event.is_customer_visible ? (
                          <span className="text-ink-secondary/70">· customer visible</span>
                        ) : null}
                      </div>
                      {event.body ? (
                        <p className="mt-1 text-[13px] leading-5 text-ink-secondary">{event.body}</p>
                      ) : null}
                    </div>
                  </li>
                ))
              )}
            </ol>
            <form action={addTicketNoteAction} className="space-y-3 border-t border-hairline bg-raised px-4 py-3">
              <input type="hidden" name="ticket_id" value={ticket.id} />
              <TextAreaField
                id="body"
                name="body"
                label="Bench note"
                placeholder="What changed, or what the customer needs to know."
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-[13px] text-ink-secondary">
                  <input
                    type="checkbox"
                    name="customer_visible"
                    defaultChecked
                    className="h-3.5 w-3.5 rounded-none border-hairline bg-canvas accent-accent"
                  />
                  Show this note to the customer
                </label>
                <SubmitButton pendingText="Saving...">Add note</SubmitButton>
              </div>
            </form>
          </Panel>
        </div>

        <div className="space-y-3">
          <Panel>
            <PanelHeader title="Bench controls" detail="Move the job, keep the numbers current." />
            <form action={updateTicketStatusAction} className="space-y-3 px-4 pb-4">
              <input type="hidden" name="ticket_id" value={ticket.id} />
              <SelectField id="status" name="status" label="Move status" defaultValue={ticket.status}>
                {TICKET_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {TICKET_STATUS_META[status].label}
                  </option>
                ))}
              </SelectField>
              <TextAreaField
                id="note"
                name="note"
                label="Status note"
                placeholder="What changed?"
                className="min-h-[64px]"
              />
              <SubmitButton pendingText="Updating..." className="w-full">
                Update status
              </SubmitButton>
            </form>

            <form action={updateTicketDetailsAction} className="space-y-3 border-t border-hairline bg-raised px-4 py-3">
              <input type="hidden" name="ticket_id" value={ticket.id} />
              <div className="grid grid-cols-2 gap-3">
                <SelectField id="priority" name="priority" label="Priority" defaultValue={ticket.priority}>
                  {TICKET_PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {PRIORITY_META[priority].label}
                    </option>
                  ))}
                </SelectField>
                <SelectField
                  id="assigned_to"
                  name="assigned_to"
                  label="Technician"
                  defaultValue={ticket.assigned_to ?? ""}
                >
                  <option value="">Unassigned</option>
                  {staff.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name || member.email}
                    </option>
                  ))}
                </SelectField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  id="estimate"
                  name="estimate"
                  label="Estimate"
                  defaultValue={(ticket.estimate_cents / 100).toFixed(2)}
                  inputMode="decimal"
                />
                <FormField
                  id="labour"
                  name="labour"
                  label="Labour"
                  defaultValue={(ticket.labour_cents / 100).toFixed(2)}
                  inputMode="decimal"
                />
              </div>
              <FormField id="due_at" name="due_at" type="date" label="Target date" defaultValue={ticket.due_at ?? ""} />
              <TextAreaField
                id="diagnosis"
                name="diagnosis"
                label="Diagnosis"
                defaultValue={ticket.diagnosis ?? ""}
                placeholder="What did the bench find?"
                className="min-h-[72px]"
              />
              <SubmitButton pendingText="Saving..." className="w-full">
                Save details
              </SubmitButton>
            </form>
          </Panel>

          <Panel className="px-4 py-3.5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[13.5px] font-semibold text-ink">Customer</h2>
              <Link href={`/customers/${ticket.customer.id}`} className="text-[13px] text-ink-secondary transition-colors hover:text-accent-deep">
                Open profile
              </Link>
            </div>
            <p className="mt-2 text-[13px] text-ink">{ticket.customer.full_name}</p>
            <p className="mt-0.5 text-[13px] text-ink-secondary">{ticket.customer.phone}</p>
            {ticket.customer.email ? (
              <p className="mt-0.5 break-all text-[13px] text-ink-secondary">{ticket.customer.email}</p>
            ) : null}
            <div className="mt-3 rounded bg-canvas px-2.5 py-2">
              <p className="text-[13px] text-ink-secondary">Device</p>
              <p className="mt-0.5 text-[13px] text-ink">
                {ticket.device.brand} {ticket.device.model}
              </p>
              <p className="mt-0.5 text-[13px] text-ink-secondary">
                {ticket.device.serial || "No serial"} {ticket.device.color ? `· ${ticket.device.color}` : ""}
              </p>
            </div>
          </Panel>

          <Panel>
            <PanelHeader
              title="Invoice"
              detail={invoice ? invoice.invoice_number : "Not generated yet"}
              action={invoice ? <InvoicePill status={invoice.status} /> : undefined}
            />
            <dl className="space-y-1.5 px-4 pb-2 text-[13px]">
              <Row label="Labour" value={formatMoney(invoice?.labour_cents ?? ticket.labour_cents)} />
              <Row label="Parts" value={formatMoney(invoice?.parts_cents ?? partsTotal)} />
              <Row label="Tax (12%)" value={formatMoney(invoice?.tax_cents ?? tax)} />
            </dl>
            <div className="mx-4 flex items-center justify-between border-t border-hairline py-2.5 text-[13px] text-ink">
              <span>Total</span>
              <span className="figure font-semibold">{formatMoney(invoice?.total_cents ?? total)}</span>
            </div>
            {invoice ? (
              invoice.status === "paid" ? (
                <p className="px-4 pb-3 text-[13px] text-positive">Paid {formatDate(invoice.paid_at)}</p>
              ) : canManageInvoices ? (
                <form action={markInvoicePaidAction} className="px-4 pb-3">
                  <input type="hidden" name="invoice_id" value={invoice.id} />
                  <input type="hidden" name="return_to" value={`/tickets/${ticket.id}`} />
                  <SubmitButton pendingText="Recording..." className="w-full">
                    Mark paid + collected
                  </SubmitButton>
                </form>
              ) : (
                <p className="px-4 pb-3 text-[13px] text-ink-secondary">Awaiting manager collection.</p>
              )
            ) : canManageInvoices ? (
              <form action={createInvoiceAction} className="px-4 pb-3">
                <input type="hidden" name="ticket_id" value={ticket.id} />
                <SubmitButton pendingText="Generating..." className="w-full">
                  Generate invoice
                </SubmitButton>
              </form>
            ) : (
              <p className="px-4 pb-3 text-[13px] text-ink-secondary">
                A manager generates the invoice when the repair is ready.
              </p>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-ink-secondary">{label}</dt>
      <dd className="figure text-ink">{value}</dd>
    </div>
  );
}
