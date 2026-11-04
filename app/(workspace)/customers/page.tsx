import type { Metadata } from "next";
import Link from "next/link";

import { MotionRow } from "@/components/workspace/motion-row";
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
              className="h-10 w-full rounded-lg border border-hairline bg-raised px-2.5 font-sans text-[13px] text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink-secondary/70 hover:border-hairline-strong focus:border-accent focus:ring-2 focus:ring-accent/40"
            />
          </label>
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-accent-fill px-3.5 font-sans text-[13px] font-semibold text-white transition-[filter,transform] duration-150 hover:brightness-110 active:scale-[0.98]"
          >
            Search
          </button>
          {params.q ? (
            <Link
              href="/customers"
              className="inline-flex h-10 items-center rounded-lg px-2.5 font-sans text-[13px] text-ink-secondary transition-colors hover:text-ink"
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
              <tr className="font-sans text-[13px] text-ink-secondary">
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
                <MotionRow
                  key={customer.id}
                  className="group border-t border-hairline/70 transition-colors duration-150 hover:bg-white/[0.04]"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/customers/${customer.id}`}
                      className="flex min-w-0 items-center gap-3"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-raised font-sans text-[13px] font-semibold text-ink ring-1 ring-inset ring-hairline">
                        {initials(customer.full_name)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-sans text-[14px] font-semibold text-ink group-hover:text-accent-bright">
                          {customer.full_name}
                        </span>
                        <span className="mt-0.5 block truncate font-sans text-[13px] text-ink-secondary">
                          {customer.phone}
                          {customer.email ? ` · ${customer.email}` : ""}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="hidden px-2 py-3 md:table-cell">
                    <span className="font-sans text-[14px] text-ink-secondary">
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
                    <span className="figure text-[13px] text-ink-secondary">{customer.ticket_count}</span>
                  </td>
                </MotionRow>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <p className="mt-3 font-sans text-[13px] text-ink-secondary">
        {customers.length} customer{customers.length === 1 ? "" : "s"} shown.
      </p>
    </div>
  );
}
