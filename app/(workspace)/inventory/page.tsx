import type { Metadata } from "next";
import Link from "next/link";

import { addPartAction, adjustStockAction } from "@/app/actions/repair";
import { FormField } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { SelectField } from "@/components/workspace/form-controls";
import { MotionItem } from "@/components/workspace/motion-row";
import { StaggerGroup, StaggerItem } from "@/components/workspace/stagger";
import { DataBar, Feedback, PageHeader, Panel, PrimaryLink } from "@/components/workspace/ui";
import { formatMoney } from "@/lib/repair/format";
import { getInventory } from "@/lib/repair/queries";
import { getStaff } from "@/lib/repair/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Inventory" };

const CATEGORIES = [
  "screen",
  "battery",
  "charging",
  "camera",
  "keyboard",
  "storage",
  "cooling",
  "supplies",
  "general",
];

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; notice?: string; error?: string; new?: string }>;
}) {
  const params = await searchParams;
  const [parts, staff] = await Promise.all([getInventory(params.q), getStaff()]);
  const canManage = staff?.role !== "user";
  const lowStock = parts.filter((part) => part.stock <= part.reorder_level);
  const stockValue = parts.reduce((total, part) => total + part.stock * part.cost_cents, 0);
  const openForm = params.new === "1" && canManage;

  return (
    <div>
      <PageHeader
        title="Inventory"
        description="Parts on the shelf, reorder levels, and what each repair costs."
        actions={canManage ? <PrimaryLink href="/inventory?new=1">Add part</PrimaryLink> : undefined}
      />
      <Feedback notice={params.notice} error={params.error} />

      <StaggerGroup className="mt-4 grid gap-2 sm:grid-cols-3">
        <StaggerItem>
          <Panel className="px-3.5 py-3">
            <p className="text-[13px] text-ink-secondary">Parts tracked</p>
            <p className="figure mt-1 text-[22px] font-semibold leading-none tracking-[-0.03em] text-ink">
              {parts.length}
            </p>
          </Panel>
        </StaggerItem>
        <StaggerItem>
          <Panel className="px-3.5 py-3">
            <p className="text-[13px] text-ink-secondary">Low stock</p>
            <p className="figure mt-1 text-[22px] font-semibold leading-none tracking-[-0.03em] text-warn">
              {lowStock.length}
            </p>
          </Panel>
        </StaggerItem>
        <StaggerItem>
          <Panel className="px-3.5 py-3">
            <p className="text-[13px] text-ink-secondary">Stock value at cost</p>
            <p className="figure mt-1 text-[22px] font-semibold leading-none tracking-[-0.03em] text-ink">
              {formatMoney(stockValue)}
            </p>
          </Panel>
        </StaggerItem>
      </StaggerGroup>

      {openForm ? (
        <Panel className="mt-3 px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[14px] font-semibold text-ink">Add a part</h2>
              <p className="mt-0.5 text-[13px] text-ink-secondary">
                New inventory is available to tickets immediately.
              </p>
            </div>
            <Link href="/inventory" className="text-[13px] text-ink-secondary transition-colors hover:text-ink">
              Close
            </Link>
          </div>
          <form action={addPartAction} className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <FormField id="sku" name="sku" label="SKU" placeholder="SCR-IP15-OEM" required />
              <FormField
                id="name"
                name="name"
                label="Part name"
                placeholder="iPhone 15 OLED assembly"
                required
                className="lg:col-span-2"
              />
              <SelectField id="category" name="category" label="Category" defaultValue="general">
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category[0].toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </SelectField>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <FormField id="stock" name="stock" type="number" min={0} label="Stock" defaultValue={0} />
              <FormField
                id="reorder_level"
                name="reorder_level"
                type="number"
                min={0}
                label="Reorder at"
                defaultValue={2}
              />
              <FormField id="cost" name="cost" label="Cost" inputMode="decimal" placeholder="0.00" />
              <FormField id="price" name="price" label="Sell price" inputMode="decimal" placeholder="0.00" />
              <FormField id="supplier" name="supplier" label="Supplier" placeholder="Optional" />
            </div>
            <div className="flex justify-end">
              <SubmitButton pendingText="Adding...">Add to inventory</SubmitButton>
            </div>
          </form>
        </Panel>
      ) : null}

      <Panel className="mt-3">
        <form className="flex flex-wrap items-center gap-2 p-3">
          <label className="relative min-w-[220px] flex-1">
            <span className="sr-only">Search inventory</span>
            <input
              name="q"
              defaultValue={params.q}
              placeholder="Search part, SKU, category, supplier"
              className="h-8 w-full rounded-lg border border-hairline bg-canvas px-2.5 text-[13px] text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink-secondary/60 focus:border-accent focus:ring-2 focus:ring-accent/40"
            />
          </label>
          <button
            type="submit"
            className="inline-flex h-8 items-center justify-center rounded-lg bg-overlay px-3 text-[13px] font-medium text-ink transition-colors hover:bg-hairline"
          >
            Search
          </button>
          {params.q ? (
            <Link
              href="/inventory"
              className="inline-flex h-8 items-center rounded px-2.5 text-[13px] text-ink-secondary transition-colors hover:text-ink"
            >
              Clear
            </Link>
          ) : null}
        </form>

        <div className="hidden grid-cols-[1.7fr_0.8fr_0.7fr_0.8fr_0.9fr] gap-3 px-3 pb-1.5 text-[13px] text-ink-secondary lg:grid">
          <span>Part</span>
          <span>On the shelf</span>
          <span>Reorder at</span>
          <span>Price</span>
          <span className="text-right">Adjust</span>
        </div>

        <ul className="pb-2">
          {parts.length === 0 ? (
            <li className="px-3 py-8 text-center text-[13px] text-ink-secondary">No parts match that search.</li>
          ) : (
            parts.map((part) => {
              const low = part.stock <= part.reorder_level;
              return (
                <MotionItem
                  key={part.id}
                  className="grid gap-2 rounded-lg px-3 py-2.5 transition-colors duration-150 hover:bg-white/[0.04] lg:grid-cols-[1.7fr_0.8fr_0.7fr_0.8fr_0.9fr] lg:items-center lg:gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[13px] font-semibold text-ink">{part.name}</p>
                      {low ? (
                        <span className="text-[13px] text-warn">
                          {part.stock === 0 ? "Out" : "Low"}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 truncate text-[13px] text-ink-secondary">
                      <span className="mono-id text-[11px]">{part.sku}</span> · {part.category}
                      {part.supplier ? ` · ${part.supplier}` : ""}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="figure text-[13px] text-ink">{part.stock}</span>
                      <span className="text-[13px] text-ink-secondary lg:hidden">in stock</span>
                    </div>
                    <div className="mt-1 max-w-[120px]">
                      <DataBar
                        value={part.stock}
                        max={Math.max(part.reorder_level * 2, part.stock)}
                        tone={low ? "bg-warn" : "bg-positive"}
                      />
                    </div>
                  </div>
                  <p className="figure text-[13px] text-ink-secondary">{part.reorder_level}</p>
                  <div>
                    <p className="figure text-[13px] text-ink">{formatMoney(part.price_cents)}</p>
                    <p className="text-[13px] text-ink-secondary">cost {formatMoney(part.cost_cents)}</p>
                  </div>
                  <div className="flex gap-1.5 lg:justify-end">
                    {canManage ? (
                      <>
                        <form action={adjustStockAction}>
                          <input type="hidden" name="part_id" value={part.id} />
                          <input type="hidden" name="delta" value="-1" />
                          <button
                            type="submit"
                            disabled={part.stock === 0}
                            className="grid h-7 w-7 place-items-center rounded-lg border border-hairline text-[13.5px] text-ink-secondary transition-colors hover:border-negative/40 hover:text-negative disabled:opacity-30"
                            aria-label={`Remove one ${part.name}`}
                          >
                            −
                          </button>
                        </form>
                        <form action={adjustStockAction}>
                          <input type="hidden" name="part_id" value={part.id} />
                          <input type="hidden" name="delta" value="1" />
                          <button
                            type="submit"
                            className="grid h-7 w-7 place-items-center rounded-lg border border-hairline text-[13.5px] text-ink-secondary transition-colors hover:border-positive/40 hover:text-positive"
                            aria-label={`Add one ${part.name}`}
                          >
                            +
                          </button>
                        </form>
                      </>
                    ) : (
                      <span className="text-[13px] text-ink-secondary">Manager-managed</span>
                    )}
                  </div>
                </MotionItem>
              );
            })
          )}
        </ul>
      </Panel>

      <p className="mt-3 text-[13px] leading-5 text-ink-secondary">
        Stock moves automatically when a part is attached to a ticket. Manual adjustments are owner-
        and manager-controlled.
      </p>
    </div>
  );
}
