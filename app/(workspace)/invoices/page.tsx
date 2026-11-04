import type { Metadata } from "next";
import Link from "next/link";

import { markInvoicePaidAction } from "@/app/actions/repair";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  EmptyState,
  Feedback,
  InvoicePill,
  PageHeader,
  Panel,
  PanelHeader,
  PrimaryLink,
} from "@/components/workspace/ui";
import { formatDate, formatMoney } from "@/lib/repair/format";
import { getInvoices } from "@/lib/repair/queries";
import { getStaff } from "@/lib/repair/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Invoices" };

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const params = await searchParams;
  const [invoices, staff] = await Promise.all([getInvoices(), getStaff()]);
  const canManage = staff?.role !== "user";
  const paid = invoices.filter((invoice) => invoice.status === "paid");
  const unpaid = invoices.filter(
    (invoice) => invoice.status !== "paid" && invoice.status !== "void",
  );
  const revenue = paid.reduce((total, invoice) => total + invoice.total_cents, 0);

  return (
    <div>
      <PageHeader
        title="Invoices"
        description="Repair totals, tax, and collection status."
        actions={<PrimaryLink href="/tickets">Open tickets</PrimaryLink>}
      />
      <Feedback notice={params.notice} error={params.error} />

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <Panel className="px-3.5 py-3">
          <p className="text-[13px] text-muted">Collected</p>
          <p className="figure mt-1 text-[22px] font-semibold leading-none tracking-[-0.03em] text-positive">
            {formatMoney(revenue)}
          </p>
        </Panel>
        <Panel className="px-3.5 py-3">
          <p className="text-[13px] text-muted">Unpaid</p>
          <p className="figure mt-1 text-[22px] font-semibold leading-none tracking-[-0.03em] text-warn">
            {unpaid.length}
          </p>
        </Panel>
        <Panel className="px-3.5 py-3">
          <p className="text-[13px] text-muted">Invoices issued</p>
          <p className="figure mt-1 text-[22px] font-semibold leading-none tracking-[-0.03em] text-ink">
            {invoices.length}
          </p>
        </Panel>
      </div>

      <Panel className="mt-3">
        <PanelHeader title="Invoice ledger" detail="Newest first. Payment marks the ticket collected." />

        {invoices.length === 0 ? (
          <div className="px-3 pb-3">
            <EmptyState
              title="No invoices yet"
              body="Open a ticket and generate an invoice once the repair total is known."
              action={<PrimaryLink href="/tickets">Open tickets</PrimaryLink>}
            />
          </div>
        ) : (
          <>
            <div className="hidden grid-cols-[6.5rem_5.5rem_1fr_1fr_6rem_6rem_8rem] gap-3 px-3 pb-1.5 text-[13px] text-muted lg:grid">
              <span>Invoice</span>
              <span>Ticket</span>
              <span>Customer</span>
              <span>Device</span>
              <span>Status</span>
              <span className="text-right">Total</span>
              <span className="text-right">Action</span>
            </div>
            <ul className="pb-2">
              {invoices.map((invoice) => (
                <li
                  key={invoice.id}
                  className="grid gap-1.5 px-3 py-2.5 lg:grid-cols-[6.5rem_5.5rem_1fr_1fr_6rem_6rem_8rem] lg:items-center lg:gap-3"
                >
                  <span>
                    <span className="figure block text-[13px] text-ink">
                      {invoice.invoice_number}
                    </span>
                    <span className="mt-0.5 block text-[13px] text-muted">
                      {formatDate(invoice.issued_at)}
                    </span>
                  </span>
                  <Link
                    href={`/tickets/${invoice.ticket_id}`}
                    className="figure text-[13px] text-muted transition-colors hover:text-ink"
                  >
                    {invoice.ticket.ticket_number}
                  </Link>
                  <span className="truncate text-[13px] text-ink">
                    {invoice.ticket.customer.full_name}
                  </span>
                  <span className="truncate text-[13px] text-muted">
                    {invoice.ticket.device.brand} {invoice.ticket.device.model}
                  </span>
                  <InvoicePill status={invoice.status} />
                  <span className="figure text-[13px] font-medium text-ink lg:text-right">
                    {formatMoney(invoice.total_cents)}
                  </span>
                  <span className="flex lg:justify-end">
                    {invoice.status === "paid" ? (
                      <span className="text-[13px] text-muted">
                        Paid {formatDate(invoice.paid_at)}
                      </span>
                    ) : invoice.status === "void" ? (
                      <span className="text-[13px] text-muted">Void</span>
                    ) : canManage ? (
                      <form action={markInvoicePaidAction}>
                        <input type="hidden" name="invoice_id" value={invoice.id} />
                        <input type="hidden" name="return_to" value="/invoices" />
                        <SubmitButton pendingText="Recording...">Mark paid</SubmitButton>
                      </form>
                    ) : (
                      <span className="text-[13px] text-muted">Manager review</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </Panel>
    </div>
  );
}
