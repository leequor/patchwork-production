"use client";

import { useState } from "react";

import { updatePartPriceAction } from "@/app/actions/repair";
import { formatMoney } from "@/lib/repair/format";
import { cn } from "@/lib/utils";

/**
 * One price, edited in place.
 *
 * A part's sell price changes for one reason at a time — a supplier moved, a
 * screen family went up — so the control lives on the row it belongs to rather
 * than behind a batch dialog. The read state has to look like the rest of the
 * table (mono figures, no chrome); the edit state has to look like a field.
 *
 * Selling under cost is the shop's own call, so it is allowed — but it is
 * stated plainly, on the row, while you type.
 */
export function PriceEditor({
  partId,
  partName,
  priceCents,
  costCents,
}: {
  partId: string;
  partName: string;
  priceCents: number;
  costCents: number;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState((priceCents / 100).toFixed(2));

  const parsed = Number(draft.replace(/[^0-9.]/g, ""));
  const draftCents = Number.isFinite(parsed) ? Math.round(parsed * 100) : NaN;
  const belowCost = Number.isFinite(draftCents) && draftCents < costCents;
  const invalid = !Number.isFinite(draftCents) || draftCents < 0;

  if (!editing) {
    const underCost = priceCents < costCents;
    return (
      <div className="group/price">
        <p className={cn("figure text-[13px]", underCost ? "text-warn" : "text-ink")}>
          {formatMoney(priceCents)}
        </p>
        <div className="mt-0.5 flex items-baseline gap-1.5">
          <span className="text-[13px] text-ink-secondary">
            {underCost ? `under cost by ${formatMoney(costCents - priceCents)}` : `cost ${formatMoney(costCents)}`}
          </span>
          <button
            type="button"
            onClick={() => {
              setDraft((priceCents / 100).toFixed(2));
              setEditing(true);
            }}
            className="rounded-sm px-1 text-[12px] text-ink-faint underline-offset-2 transition-colors hover:text-accent-bright hover:underline focus-visible:text-accent-bright"
            aria-label={`Edit the price of ${partName}`}
          >
            Edit
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      action={updatePartPriceAction}
      onSubmit={(event) => {
        if (invalid) event.preventDefault();
      }}
      className="min-w-0"
    >
      <input type="hidden" name="part_id" value={partId} />
      <div className="flex items-center gap-1.5">
        <span aria-hidden="true" className="font-mono text-[13px] text-ink-secondary">
          $
        </span>
        <input
          name="price"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setEditing(false);
          }}
          inputMode="decimal"
          autoComplete="off"
          autoFocus
          aria-label={`New price for ${partName}`}
          aria-invalid={invalid || belowCost}
          className={cn(
            "field-inset h-8 w-[92px] rounded-sm px-2 font-mono text-[13px] text-ink outline-none",
            "transition-shadow duration-150",
            belowCost && "text-warn",
          )}
        />
        <button
          type="submit"
          disabled={invalid}
          className="h-8 rounded-sm bg-accent px-2 text-[12px] font-semibold text-white transition-[filter] hover:brightness-110 disabled:opacity-40"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="h-8 rounded-sm px-1.5 text-[12px] text-ink-secondary transition-colors hover:text-ink"
        >
          Cancel
        </button>
      </div>
      <p
        className={cn(
          "mt-1 text-[12px] leading-4",
          belowCost ? "text-warn" : "text-ink-tertiary",
        )}
        aria-live="polite"
      >
        {invalid
          ? "Enter an amount, for example 79.00."
          : belowCost
            ? `Under cost by ${formatMoney(costCents - draftCents)}.`
            : `Margin ${formatMoney(draftCents - costCents)}`}
      </p>
    </form>
  );
}
