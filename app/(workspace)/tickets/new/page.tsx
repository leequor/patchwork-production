import type { Metadata } from "next";
import Link from "next/link";

import { Feedback, PageHeader, Panel } from "@/components/workspace/ui";
import { TicketIntakeForm } from "@/components/workspace/ticket-intake-form";
import { getCustomerOptions, getStaffProfiles } from "@/lib/repair/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "New ticket" };

type SearchParams = Promise<{ error?: string; mode?: string }>;

export default async function NewTicketPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const [customers, staff] = await Promise.all([getCustomerOptions(), getStaffProfiles()]);

  return (
    <div>
      <PageHeader
        title="New intake"
        description="Log the device, record the fault, and put it in the queue."
        actions={
          <Link
            href="/tickets"
            className="inline-flex h-9 items-center justify-center rounded-sm bg-overlay px-3.5 text-[13px] font-semibold text-ink transition-colors hover:border-ink-secondary/40"
          >
            Back to tickets
          </Link>
        }
      />
      <Feedback error={params.error} />

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.45fr_0.55fr]">
        <Panel className="p-5 sm:p-6">
          <TicketIntakeForm
            customers={customers}
            staff={staff}
            initialMode={params.mode === "new" ? "new" : "existing"}
          />
        </Panel>

        <div className="grid content-start gap-4">
          <Panel className="overflow-hidden">
            <div className="px-5 pt-4 pb-2">
              <h2 className="text-[15px] font-medium text-ink">Intake checklist</h2>
              <p className="mt-0.5 text-[13px] text-ink-secondary">Do these before the device leaves the counter.</p>
            </div>
            <ol className="space-y-1">
              {[
                "Confirm the customer's phone and email.",
                "Record the exact fault and any existing damage.",
                "Photograph the device if it is already damaged.",
                "Give the customer the tracking code from the ticket page.",
              ].map((item, index) => (
                <li key={item} className="flex gap-3 px-5 py-3">
                  <span className="figure mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-sm bg-overlay text-[13px] text-ink">
                    {index + 1}
                  </span>
                  <p className="text-[13px] leading-5 text-ink-secondary">{item}</p>
                </li>
              ))}
            </ol>
          </Panel>

          <Panel className="p-5">
            <h2 className="text-[14px] font-medium text-ink">What the customer gets</h2>
            <p className="mt-2 text-[13px] leading-5 text-ink-secondary">
              Every ticket gets a tracking code. The customer opens{" "}
              <Link href="/track" className="text-accent underline underline-offset-2 hover:text-accent-deep">
                /track
              </Link>{" "}
              and enters the code. No email or phone number is needed.
            </p>
            <div className="mt-4 rounded bg-canvas p-3">
              <p className="text-[13px] text-ink-secondary">Customer sees</p>
              <p className="mt-1 text-[13px] text-ink">Status, device, issue, and visible timeline notes.</p>
            </div>
          </Panel>

          <Panel className="p-5">
            <h2 className="text-[14px] font-medium text-ink">Billing default</h2>
            <p className="mt-2 text-[13px] leading-5 text-ink-secondary">
              Invoices add labour plus parts and apply a 12% tax. You can edit labour and the estimate
              from the ticket after diagnosis.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
