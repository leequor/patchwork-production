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
          <label className="min-w-[220px] flex-1">
            <span className="sr-only">Search customers</span>
            <input
              name="q"
              defaultValue={params.q}
              placeholder="Search name, email, phone, or company"
              className="h-10 w-full rounded-sm border border-line bg-raised px-2.5 font-sans text-[13px] text-ink outline-none placeholder:text-muted/70 focus:border-accent"
            />
          </label>
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-sm bg-accent px-3.5 font-sans text-[13px] font-semibold text-onAccent transition-[background-color,transform] duration-150 hover:bg-gold active:scale-[0.98]"
          >
            Search
          </button>
          {params.q ? (
            <Link
              href="/customers"
              className="inline-flex h-10 items-center rounded-sm px-2.5 font-sans text-[13px] text-muted transition-colors hover:text-ink"
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
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="font-sans text-[13px] text-muted">
                <th scope="col" className="px-4 pb-2 font-normal">
                  Customer
                </th>
                <th scope="col" className="hidden px-2 pb-2 font-normal md:table-cell">
                  Company
                </th>
                <th scope="col" className="px-2 pb-2 text-right font-normal">
                  Devices
                </th>
                <th scope="col" className="px-2 pb-2 text-right font-normal">
                  Open
                </th>
                <th scope="col" className="px-4 pb-2 text-right font-normal">
                  All tickets
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="group border-t border-line/70">
                  <td className="px-4 py-3">
                    <Link
                      href={`/customers/${customer.id}`}
                      className="flex min-w-0 items-center gap-3"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center bg-wash font-sans text-[13px] font-semibold text-ink">
                        {initials(customer.full_name)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-sans text-[14px] font-medium text-ink group-hover:text-accent">
                          {customer.full_name}
                        </span>
                        <span className="mt-0.5 block truncate font-serif text-[13px] text-muted">
                          {customer.phone}
                          {customer.email ? ` · ${customer.email}` : ""}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="hidden px-2 py-3 md:table-cell">
                    <span className="font-serif text-[14px] text-muted">
                      {customer.company || "—"}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-right">
                    <span className="figure text-[14px] text-ink">{customer.device_count}</span>
                  </td>
                  <td className="px-2 py-3 text-right">
                    <span className="figure text-[14px] text-ink">{customer.open_count}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="figure text-[13px] text-muted">{customer.ticket_count}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <p className="mt-3 font-serif text-[13px] text-muted">
        {customers.length} customer{customers.length === 1 ? "" : "s"} shown.
      </p>
    </div>
  );
}
