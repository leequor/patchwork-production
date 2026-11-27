import Link from "next/link";

import { RelativeTime } from "@/components/ui/relative-time";
import { formatMoney } from "@/lib/repair/format";
import type { Part, TicketRow } from "@/lib/repair/types";
import { previewHref } from "@/lib/preview/navigation";
import { initials } from "@/lib/utils";
import { PREVIEW_QUEUE } from "@/lib/preview/fixtures";

import {
  EmptyState,
  InvoicePill,
  PageHeader,
  Panel,
  PanelHeader,
  PrimaryLink,
  PriorityPill,
  StatusPill,
} from "./ui";

const FILTER =
  "field-inset h-10 w-full rounded border border-hairline px-3 font-sans text-[13px] text-ink-secondary";

const PREVIEW_PARTS: Part[] = [
  {
    id: "preview-part-screen",
    sku: "DSP-IP15P",
    name: "iPhone 15 Pro display assembly",
    category: "screen",
    stock: 4,
    reorder_level: 2,
    cost_cents: 11800,
    price_cents: 17900,
    supplier: "Northstar Components",
    created_at: "2026-10-12T09:00:00.000Z",
    updated_at: "2026-11-25T12:00:00.000Z",
  },
  {
    id: "preview-part-battery",
    sku: "BAT-IP14",
    name: "iPhone 14 replacement battery",
    category: "battery",
    stock: 2,
    reorder_level: 3,
    cost_cents: 3600,
    price_cents: 6900,
    supplier: "Aperture Supply",
    created_at: "2026-09-06T09:00:00.000Z",
    updated_at: "2026-11-27T08:00:00.000Z",
  },
  {
    id: "preview-part-port",
    sku: "USBC-SW-OLED",
    name: "Switch OLED USB-C port",
    category: "charging",
    stock: 1,
    reorder_level: 2,
    cost_cents: 1800,
    price_cents: 4200,
    supplier: "Northstar Components",
    created_at: "2026-10-21T09:00:00.000Z",
    updated_at: "2026-11-26T14:00:00.000Z",
  },
  {
    id: "preview-part-keyboard",
    sku: "KB-XPS13-23",
    name: "XPS 13 keyboard assembly",
    category: "keyboard",
    stock: 8,
    reorder_level: 2,
    cost_cents: 7400,
    price_cents: 11200,
    supplier: "Aperture Supply",
    created_at: "2026-09-19T09:00:00.000Z",
    updated_at: "2026-11-21T14:00:00.000Z",
  },
  {
    id: "preview-part-adhesive",
    sku: "ADH-ROLL-02",
    name: "Display adhesive strips, 10 pack",
    category: "supplies",
    stock: 14,
    reorder_level: 5,
    cost_cents: 950,
    price_cents: 1800,
    supplier: "Bench Supply Co.",
    created_at: "2026-08-03T09:00:00.000Z",
    updated_at: "2026-11-18T14:00:00.000Z",
  },
];

const PREVIEW_TEAM = [
  { id: "preview-staff-owner", name: "Alex Moreau", email: "alex@luckypatcher.test", role: "superadmin", open: 4, active: 2 },
  { id: "preview-staff-deniz", name: "Deniz Kaya", email: "deniz@luckypatcher.test", role: "admin", open: 3, active: 2 },
  { id: "preview-staff-priya", name: "Priya Raman", email: "priya@luckypatcher.test", role: "user", open: 2, active: 1 },
] as const;

const PREVIEW_INVOICES = [
  { number: "INV-1062", ticket: PREVIEW_QUEUE[3], status: "paid" as const, total: 46000, issued: "2026-11-26T09:00:00.000Z" },
  { number: "INV-1061", ticket: PREVIEW_QUEUE[0], status: "sent" as const, total: 24900, issued: "2026-11-25T13:30:00.000Z" },
  { number: "INV-1060", ticket: PREVIEW_QUEUE[2], status: "draft" as const, total: 12000, issued: "2026-11-24T10:15:00.000Z" },
];

const CUSTOMER_TICKETS = Array.from(
  new Map(PREVIEW_QUEUE.map((ticket) => [ticket.customer.id, ticket])).values(),
);

function FilterBox({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="sr-only">{label}</span>
      <div className={FILTER} aria-label={label}>
        {value}
      </div>
    </div>
  );
}

function SampleNotice() {
  return (
    <p className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
      <span className="h-1.5 w-1.5 rounded-full bg-accent-bright" aria-hidden="true" />
      Fixture data · preview only
    </p>
  );
}

function TicketList() {
  return (
    <div>
      <SampleNotice />
      <PageHeader
        title="Tickets"
        description="Every device on the bench, from intake to collection."
        actions={<PrimaryLink href={previewHref("/tickets/new")}>New ticket</PrimaryLink>}
      />

      <Panel className="mt-4">
        <div className="grid gap-2 p-3 lg:grid-cols-[1.7fr_1fr_0.9fr_1.1fr_auto]">
          <FilterBox label="Search tickets" value="Ticket, customer, phone, device" />
          <FilterBox label="Status filter" value="All statuses  ⌄" />
          <FilterBox label="Priority filter" value="All priorities  ⌄" />
          <FilterBox label="Technician filter" value="Any technician  ⌄" />
          <span className="primary inline-flex h-10 items-center justify-center rounded-sm px-4 text-[13px] font-semibold">
            Filter
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="font-sans text-[13px] text-ink-secondary">
                <th scope="col" className="px-4 pb-2 font-normal">Ticket</th>
                <th scope="col" className="px-2 pb-2 font-normal">Customer</th>
                <th scope="col" className="hidden px-2 pb-2 font-normal xl:table-cell">Issue</th>
                <th scope="col" className="px-2 pb-2 font-normal">Status</th>
                <th scope="col" className="hidden px-2 pb-2 font-normal lg:table-cell">Priority</th>
                <th scope="col" className="hidden px-4 pb-2 text-right font-normal sm:table-cell">Updated</th>
              </tr>
            </thead>
            <tbody>
              {PREVIEW_QUEUE.slice(0, 7).map((ticket) => (
                <tr key={ticket.id} className="group border-t border-hairline transition-colors hover:bg-raised/50">
                  <td className="px-4 py-3 align-top">
                    <Link href={previewHref(`/tickets/${ticket.id}`)} className="block">
                      <span className="mono-id block text-[13px] font-medium group-hover:text-accent-bright">{ticket.ticket_number}</span>
                      <span className="mono-id mt-0.5 block text-[11px] text-ink-faint">{ticket.public_code}</span>
                    </Link>
                  </td>
                  <td className="px-2 py-3">
                    <span className="block truncate text-[14px] font-semibold text-ink">{ticket.customer.full_name}</span>
                    <span className="mt-0.5 block truncate text-[13px] text-ink-secondary">{ticket.device.brand} {ticket.device.model}</span>
                  </td>
                  <td className="hidden max-w-[34ch] px-2 py-3 text-[13px] leading-5 text-ink-secondary xl:table-cell">{ticket.issue}</td>
                  <td className="px-2 py-3"><StatusPill status={ticket.status} /></td>
                  <td className="hidden px-2 py-3 lg:table-cell"><PriorityPill priority={ticket.priority} /></td>
                  <td className="hidden px-4 py-3 text-right sm:table-cell"><RelativeTime value={ticket.updated_at} className="figure text-[13px] text-ink-secondary" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <p className="mt-3 text-[13px] text-ink-secondary">7 sample tickets shown.</p>
    </div>
  );
}

function CustomerList() {
  return (
    <div>
      <SampleNotice />
      <PageHeader
        title="Customers"
        description="Contact details, devices, and every repair attached to the person."
        actions={<PrimaryLink href={previewHref("/customers/new")}>New customer</PrimaryLink>}
      />
      <Panel className="mt-4">
        <div className="flex flex-wrap items-center gap-2 p-3">
          <div className={`${FILTER} min-w-[220px] flex-1`}>Search name, email, phone, or company</div>
          <span className="primary inline-flex h-9 items-center rounded-sm px-3.5 text-[13px] font-semibold">Search</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[440px] border-collapse text-left">
            <thead><tr className="text-[13px] text-ink-secondary">
              <th scope="col" className="px-4 pb-2 font-normal">Customer</th>
              <th scope="col" className="hidden px-2 pb-2 font-normal md:table-cell">Company</th>
              <th scope="col" className="px-2 pb-2 text-right font-normal">Devices</th>
              <th scope="col" className="px-2 pb-2 text-right font-normal">Open</th>
              <th scope="col" className="hidden px-4 pb-2 text-right font-normal sm:table-cell">All tickets</th>
            </tr></thead>
            <tbody>
              {CUSTOMER_TICKETS.slice(0, 7).map((ticket, index) => (
                <tr key={ticket.customer.id} className="group border-t border-hairline/70 transition-colors hover:bg-raised/50">
                  <td className="px-4 py-3">
                    <Link href={previewHref(`/customers/${ticket.customer.id}`)} className="flex min-w-0 items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-raised text-[13px] font-semibold text-ink ring-1 ring-inset ring-hairline">{initials(ticket.customer.full_name)}</span>
                      <span className="min-w-0"><span className="block truncate text-[14px] font-semibold text-ink group-hover:text-accent-bright">{ticket.customer.full_name}</span><span className="mt-0.5 block truncate text-[13px] text-ink-secondary">{ticket.customer.phone} · {ticket.customer.email}</span></span>
                    </Link>
                  </td>
                  <td className="hidden px-2 py-3 text-[14px] text-ink-secondary md:table-cell">—</td>
                  <td className="figure px-2 py-3 text-right text-[14px] text-ink">{index % 3 === 0 ? 2 : 1}</td>
                  <td className="figure px-2 py-3 text-right text-[14px] text-ink">{ticket.status === "ready" || ticket.status === "picked_up" ? 0 : 1}</td>
                  <td className="figure hidden px-4 py-3 text-right text-[13px] text-ink-secondary sm:table-cell">{index % 2 === 0 ? 2 : 1}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <p className="mt-3 text-[13px] text-ink-secondary">7 sample customers shown.</p>
    </div>
  );
}

function InventoryPage() {
  const lowStock = PREVIEW_PARTS.filter((part) => part.stock <= part.reorder_level).length;
  const stockValue = PREVIEW_PARTS.reduce((sum, part) => sum + part.stock * part.cost_cents, 0);
  return (
    <div>
      <SampleNotice />
      <PageHeader title="Inventory" description="Parts on the shelf, reorder levels, and what each repair costs." actions={<span className="primary inline-flex h-9 items-center rounded-sm px-3.5 text-[13px] font-semibold">Add part</span>} />
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <Metric label="Parts tracked" value={String(PREVIEW_PARTS.length)} />
        <Metric label="Low stock" value={String(lowStock)} tone="text-warn" />
        <Metric label="Stock value at cost" value={formatMoney(stockValue)} />
      </div>
      <Panel className="mt-3">
        <PanelHeader title="Parts shelf" detail="Cost, price and reorder point at a glance." />
        <div className="overflow-x-auto px-3 pb-3">
          <table className="w-full min-w-[620px] border-collapse text-left">
            <thead><tr className="text-[13px] text-ink-secondary"><th scope="col" className="pb-2 font-normal">Part</th><th scope="col" className="pb-2 font-normal">Category</th><th scope="col" className="pb-2 text-right font-normal">In stock</th><th scope="col" className="pb-2 text-right font-normal">Cost</th><th scope="col" className="pb-2 text-right font-normal">Price</th></tr></thead>
            <tbody>{PREVIEW_PARTS.map((part) => (
              <tr key={part.id} className="border-t border-hairline">
                <td className="py-3"><span className="block text-[13px] font-medium text-ink">{part.name}</span><span className="mono-id mt-0.5 block text-[11px] text-ink-faint">{part.sku}</span></td>
                <td className="py-3 text-[13px] capitalize text-ink-secondary">{part.category}</td>
                <td className="figure py-3 text-right text-[13px] text-ink">{part.stock}<span className="ml-1 text-[11px] text-ink-faint">/ min {part.reorder_level}</span></td>
                <td className="figure py-3 text-right text-[13px] text-ink-secondary">{formatMoney(part.cost_cents)}</td>
                <td className="figure py-3 text-right text-[13px] text-ink">{formatMoney(part.price_cents)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function Metric({ label, value, tone = "text-ink" }: { label: string; value: string; tone?: string }) {
  return <Panel className="px-3.5 py-3"><p className="text-[13px] text-ink-secondary">{label}</p><p className={`figure mt-1 text-[22px] font-semibold leading-none tracking-[-0.03em] ${tone}`}>{value}</p></Panel>;
}

function InvoicesPage() {
  const collected = PREVIEW_INVOICES.filter((invoice) => invoice.status === "paid").reduce((sum, invoice) => sum + invoice.total, 0);
  const unpaid = PREVIEW_INVOICES.filter((invoice) => invoice.status === "sent" || invoice.status === "draft").length;
  return (
    <div>
      <SampleNotice />
      <PageHeader title="Invoices" description="Repair totals, tax, and collection status." actions={<PrimaryLink href={previewHref("/tickets")}>Open tickets</PrimaryLink>} />
      <div className="mt-4 grid gap-2 sm:grid-cols-3"><Metric label="Collected" value={formatMoney(collected)} tone="text-positive" /><Metric label="Unpaid" value={String(unpaid)} tone="text-warn" /><Metric label="Invoices issued" value={String(PREVIEW_INVOICES.length)} /></div>
      <Panel className="mt-3">
        <PanelHeader title="Invoice ledger" detail="Newest first. Payment marks the ticket collected." />
        <div className="overflow-x-auto px-3 pb-2">
          <table className="w-full min-w-[680px] border-collapse text-left">
            <thead><tr className="text-[13px] text-ink-secondary"><th scope="col" className="pb-2 font-normal">Invoice</th><th scope="col" className="pb-2 font-normal">Ticket</th><th scope="col" className="pb-2 font-normal">Customer</th><th scope="col" className="pb-2 font-normal">Device</th><th scope="col" className="pb-2 font-normal">Status</th><th scope="col" className="pb-2 text-right font-normal">Total</th><th scope="col" className="pb-2 text-right font-normal">Action</th></tr></thead>
            <tbody>{PREVIEW_INVOICES.map((invoice) => (
              <tr key={invoice.number} className="border-t border-hairline">
                <td className="py-3"><span className="mono-id text-[13px]">{invoice.number}</span><span className="mt-0.5 block text-[12px] text-ink-faint">{new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(invoice.issued))}</span></td>
                <td className="py-3"><Link href={previewHref(`/tickets/${invoice.ticket.id}`)} className="mono-id text-[12px] hover:text-accent-bright">{invoice.ticket.ticket_number}</Link></td>
                <td className="py-3 text-[13px] font-medium text-ink">{invoice.ticket.customer.full_name}</td>
                <td className="py-3 text-[13px] text-ink-secondary">{invoice.ticket.device.brand} {invoice.ticket.device.model}</td>
                <td className="py-3"><InvoicePill status={invoice.status} /></td>
                <td className="figure py-3 text-right text-[13px] font-medium text-ink">{formatMoney(invoice.total)}</td>
                <td className="py-3 text-right text-[13px] text-ink-secondary">{invoice.status === "paid" ? "Collected" : "Review"}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function TeamPage() {
  return (
    <div>
      <SampleNotice />
      <PageHeader title="Team" description="Who is on the bench, what they own, and who can manage the shop." />
      <div className="mt-4 grid gap-3 xl:grid-cols-[1.4fr_0.6fr]">
        <Panel className="self-start">
          <PanelHeader title="Staff" detail={`${PREVIEW_TEAM.length} accounts · 9 open jobs`} />
          <ul className="pb-2">{PREVIEW_TEAM.map((member) => (
            <li key={member.id} className="grid gap-2 border-t border-hairline px-3 py-3 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)_minmax(0,0.9fr)_8rem] sm:items-center sm:gap-3">
              <span className="flex min-w-0 items-center gap-2.5"><span className="grid h-8 w-8 shrink-0 place-items-center rounded bg-overlay text-[13px] font-semibold text-ink">{initials(member.name)}</span><span className="min-w-0"><span className="block truncate text-[13px] font-medium text-ink">{member.name}</span><span className="mt-0.5 block truncate text-[13px] text-ink-secondary">{member.email}</span></span></span>
              <span className="text-[13px] text-ink-secondary">{member.role === "superadmin" ? "Owner" : member.role === "admin" ? "Manager" : "Technician"}</span>
              <span className="text-[13px] text-ink-secondary"><span className="figure text-ink">{member.open}</span> open · <span className="figure text-ink">{member.active}</span> in repair</span>
              <span className="text-[12px] text-ink-faint">Sample profile</span>
            </li>
          ))}</ul>
        </Panel>
        <Panel className="self-start"><PanelHeader title="Access levels" detail="Roles determine what each person can change." /><div className="space-y-3 px-4 pb-4 text-[13px] leading-5 text-ink-secondary"><p><strong className="font-medium text-ink">Owner</strong> — staff access, roles, stock and repair records.</p><p><strong className="font-medium text-ink">Manager</strong> — day-to-day shop operations and pricing.</p><p><strong className="font-medium text-ink">Technician</strong> — assigned repairs and bench notes.</p></div></Panel>
      </div>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return <label className="block"><span className="mb-1.5 block text-[12px] font-medium text-ink-secondary">{label}</span><input readOnly value={value} className="field-inset h-10 w-full rounded border border-hairline px-3 text-[13px] text-ink" /></label>;
}

function NewTicketPage() {
  return (
    <div>
      <SampleNotice />
      <PageHeader title="New intake" description="Log the device, record the fault, and put it in the queue." actions={<PrimaryLink href={previewHref("/tickets")}>Back to tickets</PrimaryLink>} />
      <div className="mt-5 grid gap-4 xl:grid-cols-[1.45fr_0.55fr]">
        <Panel className="p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2"><ReadOnlyField label="Customer" value="Maya Ferreira · maya@example.com" /><ReadOnlyField label="Device type" value="Phone" /><ReadOnlyField label="Brand" value="Apple" /><ReadOnlyField label="Model" value="iPhone 15 Pro" /><ReadOnlyField label="Priority" value="High" /><ReadOnlyField label="Assigned technician" value="Deniz Kaya" /><div className="sm:col-span-2"><ReadOnlyField label="Reported issue" value="Screen cracked after a drop; touch still registers." /></div></div>
          <p className="mt-4 text-[12px] text-ink-faint">Preview form · changes are disabled</p>
          <button disabled className="primary mt-4 inline-flex h-9 items-center rounded-sm px-3.5 text-[13px] font-semibold opacity-50">Create ticket</button>
        </Panel>
        <div className="grid content-start gap-4">
          <Panel><PanelHeader title="Intake checklist" detail="Before the device leaves the counter." /><ol className="space-y-1 pb-2">{["Confirm the customer's contact details.", "Record the exact fault and existing damage.", "Photograph the device if it is already damaged.", "Give the customer the tracking code."].map((item, index) => <li key={item} className="flex gap-3 px-5 py-2.5"><span className="figure grid h-6 w-6 shrink-0 place-items-center rounded-sm bg-overlay text-[13px] text-ink">{index + 1}</span><span className="text-[13px] leading-5 text-ink-secondary">{item}</span></li>)}</ol></Panel>
          <Panel className="p-5"><h2 className="text-[14px] font-medium text-ink">Customer tracking</h2><p className="mt-2 text-[13px] leading-5 text-ink-secondary">Every ticket gets a tracking code. Customers can check repair progress at <Link href="/track" className="text-accent underline underline-offset-2">/track</Link>.</p></Panel>
        </div>
      </div>
    </div>
  );
}

function NewCustomerPage() {
  return (
    <div>
      <SampleNotice />
      <PageHeader title="New customer" description="Add a person before logging their first repair." actions={<PrimaryLink href={previewHref("/customers")}>Back to customers</PrimaryLink>} />
      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Panel className="grid gap-4 p-5 sm:grid-cols-2"><ReadOnlyField label="Full name" value="Maya Ferreira" /><ReadOnlyField label="Email" value="maya@example.com" /><ReadOnlyField label="Phone" value="+1 415 555 0142" /><ReadOnlyField label="Company" value="Independent" /><div className="sm:col-span-2"><ReadOnlyField label="Notes" value="Prefers text updates. Usually available after 4pm." /></div><p className="sm:col-span-2 text-[12px] text-ink-faint">Preview form · changes are disabled</p><button disabled className="primary h-9 w-fit rounded-sm px-3.5 text-[13px] font-semibold opacity-50">Add customer</button></Panel>
        <Panel className="self-start p-5"><h2 className="text-[14px] font-medium text-ink">Keep the record useful</h2><p className="mt-2 text-[13px] leading-5 text-ink-secondary">A working phone number makes handoff and collection easier. Notes stay with the customer record.</p></Panel>
      </div>
    </div>
  );
}

function TicketDetailPage({ ticket }: { ticket: TicketRow }) {
  return (
    <div>
      <SampleNotice />
      <PageHeader title={ticket.ticket_number} description={`${ticket.device.brand} ${ticket.device.model} · ${ticket.customer.full_name}`} actions={<PrimaryLink href={previewHref("/tickets")}>Back to tickets</PrimaryLink>} />
      <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <div className="grid content-start gap-3">
          <Panel><PanelHeader title="Repair overview" detail="Ticket details and current bench status." /><div className="grid gap-4 px-4 pb-4 sm:grid-cols-3"><div><p className="text-[12px] text-ink-faint">Status</p><div className="mt-1"><StatusPill status={ticket.status} /></div></div><div><p className="text-[12px] text-ink-faint">Priority</p><div className="mt-1"><PriorityPill priority={ticket.priority} /></div></div><div><p className="text-[12px] text-ink-faint">Technician</p><p className="mt-1 text-[13px] text-ink">{ticket.assignee?.full_name ?? "Unassigned"}</p></div><div className="sm:col-span-3"><p className="text-[12px] text-ink-faint">Reported issue</p><p className="mt-1 max-w-[70ch] text-[14px] leading-6 text-ink-secondary">{ticket.issue}</p></div></div></Panel>
          <Panel><PanelHeader title="Repair timeline" detail="Latest updates from the bench." /><ol className="space-y-0 px-4 pb-4">{[{ label: "Ticket opened", date: ticket.created_at }, { label: "Diagnosis in progress", date: ticket.updated_at }, { label: "Estimate shared with customer", date: ticket.updated_at }].map((event, index) => <li key={event.label} className="flex gap-3 border-t border-hairline py-3"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${index === 0 ? "bg-accent-bright" : "bg-ink-faint"}`} /><span className="min-w-0 flex-1"><span className="block text-[13px] text-ink">{event.label}</span><RelativeTime value={event.date} className="mt-0.5 block font-mono text-[11px] text-ink-faint" /></span></li>)}</ol></Panel>
        </div>
        <div className="grid content-start gap-3"><Panel><PanelHeader title="Customer" detail="Contact and repair history." /><div className="px-4 pb-4"><p className="text-[14px] font-medium text-ink">{ticket.customer.full_name}</p><p className="mt-1 text-[13px] text-ink-secondary">{ticket.customer.phone}</p><p className="mt-0.5 break-all text-[13px] text-ink-secondary">{ticket.customer.email}</p><Link href={previewHref(`/customers/${ticket.customer.id}`)} className="mt-3 inline-flex text-[13px] text-accent hover:text-accent-bright">Open customer record ↗</Link></div></Panel><Panel><PanelHeader title="Estimate" detail="Sample amounts in USD." /><div className="space-y-2 px-4 pb-4 text-[13px]"><p className="flex justify-between text-ink-secondary"><span>Labour</span><span className="figure">{formatMoney(ticket.labour_cents)}</span></p><p className="flex justify-between text-ink-secondary"><span>Parts and service</span><span className="figure">{formatMoney(Math.max(0, ticket.estimate_cents - ticket.labour_cents))}</span></p><div className="h-px bg-hairline" /><p className="flex justify-between font-medium text-ink"><span>Estimate</span><span className="figure">{formatMoney(ticket.estimate_cents)}</span></p></div></Panel></div>
      </div>
    </div>
  );
}

function CustomerDetailPage({ ticket, tickets }: { ticket: TicketRow; tickets: TicketRow[] }) {
  const customerTickets = tickets.filter((row) => row.customer.id === ticket.customer.id);
  return (
    <div>
      <SampleNotice />
      <PageHeader title={ticket.customer.full_name} description="Customer profile, devices, and repair history." actions={<PrimaryLink href={previewHref("/customers")}>Back to customers</PrimaryLink>} />
      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
        <Panel className="self-start"><PanelHeader title="Contact details" detail="Sample customer record." /><div className="space-y-3 px-4 pb-4"><div><p className="text-[12px] text-ink-faint">Email</p><p className="mt-1 break-all text-[13px] text-ink">{ticket.customer.email}</p></div><div><p className="text-[12px] text-ink-faint">Phone</p><p className="mt-1 text-[13px] text-ink">{ticket.customer.phone}</p></div><div><p className="text-[12px] text-ink-faint">Customer since</p><p className="mt-1 text-[13px] text-ink">October 2026</p></div></div></Panel>
        <Panel><PanelHeader title="Repair history" detail={`${customerTickets.length} sample ticket${customerTickets.length === 1 ? "" : "s"}.`} /><div className="divide-y divide-hairline">{customerTickets.map((row) => <Link key={row.id} href={previewHref(`/tickets/${row.id}`)} className="flex flex-wrap items-center gap-2 px-4 py-3 transition-colors hover:bg-raised/50"><span className="mono-id text-[13px] text-ink">{row.ticket_number}</span><span className="min-w-0 flex-1 truncate text-[13px] text-ink-secondary">{row.device.brand} {row.device.model}</span><StatusPill status={row.status} /></Link>)}</div></Panel>
      </div>
    </div>
  );
}

const SUPPORTED_STATIC = new Set(["tickets", "customers", "inventory", "invoices", "team", "tickets/new", "customers/new"]);

export function isSupportedPreviewSection(section: string) {
  return SUPPORTED_STATIC.has(section) || PREVIEW_QUEUE.some((ticket) => section === `tickets/${ticket.id}`) || CUSTOMER_TICKETS.some((ticket) => section === `customers/${ticket.customer.id}`);
}

export function DesignPreviewContent({ section }: { section: string }) {
  if (section === "tickets") return <TicketList />;
  if (section === "customers") return <CustomerList />;
  if (section === "inventory") return <InventoryPage />;
  if (section === "invoices") return <InvoicesPage />;
  if (section === "team") return <TeamPage />;
  if (section === "tickets/new") return <NewTicketPage />;
  if (section === "customers/new") return <NewCustomerPage />;

  const ticketMatch = section.match(/^tickets\/(preview-ticket-\d+)$/);
  if (ticketMatch) {
    const ticket = PREVIEW_QUEUE.find((row) => row.id === ticketMatch[1]);
    return ticket ? <TicketDetailPage ticket={ticket} /> : <EmptyState title="Preview ticket unavailable" body="Choose a sample ticket from the preview queue." />;
  }

  const customerMatch = section.match(/^customers\/(preview-customer-\d+)$/);
  if (customerMatch) {
    const ticket = CUSTOMER_TICKETS.find((row) => row.customer.id === customerMatch[1]);
    return ticket ? <CustomerDetailPage ticket={ticket} tickets={PREVIEW_QUEUE} /> : <EmptyState title="Preview customer unavailable" body="Choose a sample customer from the preview list." />;
  }

  return <EmptyState title="Preview page unavailable" body="Choose a section from the preview navigation." />;
}
