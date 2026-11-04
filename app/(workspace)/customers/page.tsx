import type { Metadata } from "next";
import Link from "next/link";

import {
  EmptyState,
  Feedback,
  PageHeader,
  Panel,
  PrimaryLink,
} from "@/components/workspace/ui";
import { getCustomers } from "@/lib/repair/queries";
import { initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Customers" };

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; notice?: string; error?: string }>;
}) {
  const params = await searchParams;
  const customers = await getCustomers(params.q);

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Contact details, devices, and every repair attached to the person."
        actions={<PrimaryLink href="/customers/new">New customer</PrimaryLink>}
      />
      <Feedback notice={params.notice} error={params.error} />

      <Panel className="mt-4">
        <form className="flex flex-wrap items-center gap-2 p-3">
          <label className="relative min-w-[220px] flex-1">
            <span className="sr-only">Search customers</span>
            <input
              name="q"
              defaultValue={params.q}
              placeholder="Search name, email, phone, or company"
              className="h-8 w-full rounded border border-line bg-paper px-2.5 text-[13px] text-ink outline-none placeholder:text-muted/60 focus:border-accent"
            />
          </label>
          <button
            type="submit"
            className="inline-flex h-8 items-center justify-center rounded bg-wash px-3 text-[13px] font-medium text-ink transition-colors hover:bg-line"
          >
            Search
          </button>
          {params.q ? (
            <Link
              href="/customers"
              className="inline-flex h-8 items-center rounded px-2.5 text-[13px] text-muted transition-colors hover:text-ink"
            >
              Clear
            </Link>
          ) : null}
        </form>

        {customers.length === 0 ? (
          <div className="px-3 pb-3">
            <EmptyState
              title={params.q ? "No matching customers" : "No customers yet"}
              body={
                params.q
                  ? "Try a different name, email, or phone number."
                  : "Add the first customer, attach their device, and open a ticket."
              }
              action={<PrimaryLink href="/customers/new">New customer</PrimaryLink>}
            />
          </div>
        ) : (
          <>
            <div className="hidden grid-cols-[1.6fr_1fr_5rem_5rem_5rem] gap-3 px-3 pb-1.5 text-[11.5px] text-muted md:grid">
              <span>Customer</span>
              <span>Company</span>
              <span>Devices</span>
              <span>Open</span>
              <span className="text-right">All tickets</span>
            </div>
            <ul className="pb-2">
              {customers.map((customer) => (
                <li key={customer.id}>
                  <Link
                    href={`/customers/${customer.id}`}
                    className="grid gap-1.5 px-3 py-2.5 transition-colors hover:bg-wash/40 md:grid-cols-[1.6fr_1fr_5rem_5rem_5rem] md:items-center md:gap-3"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-sm bg-wash text-[11.5px] font-semibold text-ink">
                        {initials(customer.full_name)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium text-ink">
                          {customer.full_name}
                        </span>
                        <span className="mt-0.5 block truncate text-[12px] text-muted">
                          {customer.phone}
                          {customer.email ? ` · ${customer.email}` : ""}
                        </span>
                      </span>
                    </span>
                    <span className="truncate text-[12.5px] text-muted">{customer.company || "—"}</span>
                    <span className="figure text-[12.5px] text-ink">{customer.device_count}</span>
                    <span className="figure text-[12.5px] text-ink">{customer.open_count}</span>
                    <span className="figure text-[12.5px] text-muted md:text-right">
                      {customer.ticket_count}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </Panel>

      <p className="mt-3 text-[12.5px] text-muted">
        {customers.length} customer{customers.length === 1 ? "" : "s"} shown.
      </p>
    </div>
  );
}
