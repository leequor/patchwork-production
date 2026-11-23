import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PriceHistory } from "@/components/workspace/price-history";
import type { PartPriceEvent } from "@/lib/repair/types";

const event = (over: Partial<PartPriceEvent>): PartPriceEvent => ({
  id: 1,
  part_id: "part-1",
  old_price_cents: 7900,
  new_price_cents: 6400,
  changed_by: "user-1",
  created_at: "2026-11-23T10:00:00.000Z",
  actor: { full_name: "Alex Reed" },
  ...over,
});

describe("price history", () => {
  it("renders nothing for a part with no history", () => {
    const { container } = render(<PriceHistory events={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("stays closed when a part has only ever had its starting price", () => {
    const { container } = render(
      <PriceHistory events={[event({ old_price_cents: 7900, new_price_cents: 7900 })]} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("labels the starting price as a start, not a change of zero", () => {
    render(
      <PriceHistory
        events={[
          event({ id: 2, old_price_cents: 7900, new_price_cents: 6400 }),
          event({ id: 1, old_price_cents: 7900, new_price_cents: 7900 }),
        ]}
      />,
    );

    expect(screen.getByText(/Set at \$79\.00/)).toBeInTheDocument();
  });

  it("reads a change as old to new, with who did it", () => {
    render(<PriceHistory events={[event({})]} />);

    expect(screen.getByText("$79.00")).toBeInTheDocument();
    expect(screen.getByText("$64.00")).toBeInTheDocument();
    expect(screen.getByText(/Alex Reed/)).toBeInTheDocument();
    // The arrow is decorative; the relationship is stated for screen readers.
    expect(screen.getByText(/down from \$79\.00/)).toBeInTheDocument();
  });

  it("counts the rows and hides the overflow behind a total", () => {
    const events = Array.from({ length: 6 }, (_, index) => event({ id: index + 1 }));
    render(<PriceHistory events={events} limit={4} />);

    expect(screen.getByText(/Price history · 6/)).toBeInTheDocument();
    expect(screen.getByText("+2 earlier")).toBeInTheDocument();
  });

  it("credits the system when no member is recorded", () => {
    render(<PriceHistory events={[event({ actor: null, changed_by: null })]} />);

    expect(screen.getByText(/System/)).toBeInTheDocument();
  });
});
