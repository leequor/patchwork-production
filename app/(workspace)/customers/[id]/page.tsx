import Link from "next/link";
import { notFound } from "next/navigation";

import { addDeviceAction } from "@/app/actions/repair";
import { FormField } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { SelectField } from "@/components/workspace/form-controls";
import {
  EmptyState,
  Feedback,
  Panel,
  PanelHeader,
  PrimaryLink,
  StatusPill,
} from "@/components/workspace/ui";
import { DEVICE_CATEGORY_LABELS, formatDate, formatRelative } from "@/lib/repair/format";
import { getCustomerDetail } from "@/lib/repair/queries";
import { DEVICE_CATEGORIES } from "@/lib/repair/types";
import { initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

const OPEN = ["intake", "diagnosing", "waiting_parts", "in_repair"];

export default async function CustomerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const customer = await getCustomerDetail(id);

  if (!customer) notFound();

  const openCount = customer.tickets.filter((ticket) => OPEN.includes(ticket.status)).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href="/customers" className="inline-flex items-center gap-1.5 text-[13px] text-ink-secondary transition-colors hover:text-ink">
          <span aria-hidden="true">←</span>
          All customers
        </Link>
        <PrimaryLink href="/tickets/new">New ticket</PrimaryLink>
      </div>
      <Feedback notice={query.notice} error={query.error} />

      <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-sm bg-overlay text-[13px] font-semibold text-ink">
            {initials(customer.full_name)}
          </span>
          <div className="min-w-0">
            <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.015em] text-ink">
              {customer.full_name}
            </h1>
            <p className="mt-1 text-[13px] text-ink-secondary">
              {customer.phone}
              {customer.email ? ` · ${customer.email}` : ""}
            </p>
            <p className="mt-1 text-[13px] text-ink-secondary">
              Customer since {formatDate(customer.created_at)} · {customer.devices.length} device
              {customer.devices.length === 1 ? "" : "s"} · {customer.tickets.length} ticket
              {customer.tickets.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <div className="text-right text-[13px] text-ink-secondary">
          <p>{customer.company || "Individual customer"}</p>
          {customer.notes ? <p className="mt-1 max-w-[36ch]">{customer.notes}</p> : null}
        </div>
      </header>

      <div className="mt-4 grid gap-3 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-3">
          <Panel>
            <PanelHeader title="Repair history" detail="Every ticket for this customer." />
            {customer.tickets.length === 0 ? (
              <div className="px-3 pb-3">
                <EmptyState
                  title="No repairs yet"
                  body="Attach a device below, then open the first ticket."
                  action={<PrimaryLink href="/tickets/new">New ticket</PrimaryLink>}
                />
              </div>
            ) : (
              <ul className="pb-2">
                {customer.tickets.map((ticket) => (
                  <li key={ticket.id}>
                    <Link
                      href={`/tickets/${ticket.id}`}
                      className="grid gap-1 px-3 py-2.5 transition-colors hover:bg-overlay/40 sm:grid-cols-[5.5rem_1fr_8rem_5rem] sm:items-center sm:gap-3"
                    >
                      <span className="figure text-[13px] text-ink">{ticket.ticket_number}</span>
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] text-ink">
                          {ticket.device.brand} {ticket.device.model}
                        </span>
                        <span className="mt-0.5 block truncate text-[13px] text-ink-secondary">
                          {ticket.issue}
                        </span>
                      </span>
                      <StatusPill status={ticket.status} />
                      <span className="figure text-[13px] text-ink-secondary sm:text-right">
                        {formatRelative(ticket.created_at)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel>
            <PanelHeader title="Devices" detail="Attach a device before opening its ticket." />
            {customer.devices.length === 0 ? (
              <p className="px-3 pb-3 text-[13px] text-ink-secondary">No devices attached.</p>
            ) : (
              <div className="grid gap-2 px-3 pb-3 sm:grid-cols-2">
                {customer.devices.map((device) => (
                  <div key={device.id} className="rounded bg-canvas px-3 py-2.5">
                    <p className="text-[13px] text-ink-secondary">
                      {DEVICE_CATEGORY_LABELS[device.category] ?? device.category}
                    </p>
                    <p className="mt-0.5 text-[13px] font-medium text-ink">
                      {device.brand} {device.model}
                    </p>
                    <p className="mt-0.5 text-[13px] text-ink-secondary">
                      {device.serial || "No serial"} {device.color ? `· ${device.color}` : ""}
                    </p>
                    <p className="mt-1.5 text-[13px] text-ink-secondary">Added {formatDate(device.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
            <form action={addDeviceAction} className="space-y-3 border-t border-hairline bg-raised px-3 py-3">
              <input type="hidden" name="customer_id" value={customer.id} />
              <div className="grid gap-3 sm:grid-cols-3">
                <SelectField id="category" name="category" label="Device type" defaultValue="phone">
                  {DEVICE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {DEVICE_CATEGORY_LABELS[category]}
                    </option>
                  ))}
                </SelectField>
                <FormField id="brand" name="brand" label="Brand" placeholder="Apple" required />
                <FormField id="model" name="model" label="Model" placeholder="iPhone 15 Pro" required />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField id="serial" name="serial" label="Serial / IMEI" placeholder="Optional" />
                <FormField id="color" name="color" label="Color" placeholder="Optional" />
              </div>
              <div className="flex justify-end">
                <SubmitButton pendingText="Adding...">Add device</SubmitButton>
              </div>
            </form>
          </Panel>
        </div>

        <div className="space-y-3">
          <Panel className="px-4 py-4">
            <h2 className="text-[13.5px] font-semibold text-ink">Contact</h2>
            <dl className="mt-3 space-y-2.5 text-[13px]">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-secondary">Phone</dt>
                <dd className="text-right text-ink">{customer.phone}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-secondary">Email</dt>
                <dd className="break-all text-right text-ink">{customer.email || "Not provided"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-secondary">Company</dt>
                <dd className="text-right text-ink">{customer.company || "—"}</dd>
              </div>
              <div>
                <dt className="text-ink-secondary">Notes</dt>
                <dd className="mt-0.5 leading-5 text-ink">{customer.notes || "No notes."}</dd>
              </div>
            </dl>
          </Panel>

          <Panel className="px-4 py-4">
            <h2 className="text-[13.5px] font-semibold text-ink">Numbers</h2>
            <dl className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded bg-canvas px-2 py-2 text-center">
                <dd className="figure text-[19px] font-semibold leading-none text-ink">
                  {customer.devices.length}
                </dd>
                <dt className="mt-1 text-[13px] text-ink-secondary">Devices</dt>
              </div>
              <div className="rounded bg-canvas px-2 py-2 text-center">
                <dd className="figure text-[19px] font-semibold leading-none text-ink">
                  {customer.tickets.length}
                </dd>
                <dt className="mt-1 text-[13px] text-ink-secondary">Tickets</dt>
              </div>
              <div className="rounded bg-canvas px-2 py-2 text-center">
                <dd className="figure text-[19px] font-semibold leading-none text-accent">{openCount}</dd>
                <dt className="mt-1 text-[13px] text-ink-secondary">Open</dt>
              </div>
            </dl>
          </Panel>
        </div>
      </div>
    </div>
  );
}
