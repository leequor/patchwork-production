import { RelativeTime } from "@/components/ui/relative-time";
import { formatMoney } from "@/lib/repair/format";
import type { PartPriceEvent } from "@/lib/repair/types";
import { cn } from "@/lib/utils";

/**
 * What a part used to sell for.
 *
 * Rendered as a native <details> rather than a stateful panel: it is a
 * disclosure, the browser already knows how to describe one to a screen
 * reader, and it works with JavaScript off. The rows read newest first, the
 * way a ledger is argued with.
 *
 * The first row of a part's life is its baseline — old equals new — so it is
 * labelled as a starting price rather than shown as a change of zero.
 */
export function PriceHistory({
  events,
  limit = 4,
  className,
}: {
  events: PartPriceEvent[];
  limit?: number;
  className?: string;
}) {
  if (events.length === 0) return null;

  /* Shown even when the only row is the starting price. Hiding an empty
     ledger made the feature invisible: a shop that had just changed a price
     saw nothing, and concluded the history was broken rather than empty. */
  const shown = events.slice(0, limit);
  const rest = events.length - shown.length;

  return (
    <details className={cn("group/history mt-1", className)}>
      <summary
        className={cn(
          "inline-flex cursor-pointer list-none items-center gap-1 rounded-sm text-[12px] text-ink-tertiary",
          "transition-colors hover:text-ink focus-visible:text-ink [&::-webkit-details-marker]:hidden",
        )}
      >
        <span
          aria-hidden="true"
          className="transition-transform duration-150 group-open/history:rotate-90"
        >
          ›
        </span>
        {`Price history · ${events.length}`}
      </summary>

      <ol className="mt-1.5 space-y-1 border-l border-hairline pl-2.5">
        {shown.map((event) => {
          const baseline = event.old_price_cents === event.new_price_cents;
          const down = event.new_price_cents < event.old_price_cents;

          return (
            <li key={event.id} className="text-[12px] leading-4">
              <div className="flex flex-wrap items-baseline gap-x-1.5">
                {baseline ? (
                  <span className="text-ink-secondary">
                    Set at {formatMoney(event.new_price_cents)}
                  </span>
                ) : (
                  <>
                    <span className="figure text-ink-faint">
                      {formatMoney(event.old_price_cents)}
                    </span>
                    <span aria-hidden="true" className="text-ink-faint">
                      →
                    </span>
                    <span className={cn("figure", down ? "text-warn" : "text-ink")}>
                      {formatMoney(event.new_price_cents)}
                    </span>
                    <span className="sr-only">
                      {down ? "down from" : "up from"} {formatMoney(event.old_price_cents)}
                    </span>
                  </>
                )}
              </div>
              <p className="text-ink-tertiary">
                {event.actor?.full_name ?? "System"} ·{" "}
                <RelativeTime value={event.created_at} />
              </p>
            </li>
          );
        })}
        {rest > 0 ? (
          <li className="text-[12px] leading-4 text-ink-tertiary">+{rest} earlier</li>
        ) : null}
      </ol>
    </details>
  );
}
