import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPartPriceHistory } from "@/lib/repair/queries";

/**
 * The query chain the ledger uses is
 *   from().select().in().order().limit()  →  { data, error }
 * so the fake only has to answer in that shape.
 */
function clientReturning(result: { data: unknown; error: unknown }) {
  const chain = {
    select: () => chain,
    in: () => chain,
    order: () => chain,
    limit: () => Promise.resolve(result),
  };
  return { from: () => chain };
}

describe("price history query", () => {
  beforeEach(() => {
    vi.mocked(createSupabaseServerClient).mockReset();
  });

  it("skips the round trip when there are no parts", async () => {
    expect(await getPartPriceHistory([])).toEqual([]);
    expect(createSupabaseServerClient).not.toHaveBeenCalled();
  });

  it("degrades to no history when the ledger table has not been migrated yet", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      clientReturning({
        data: null,
        error: {
          code: "42P01",
          message: 'relation "public.part_price_events" does not exist',
        },
      }) as never,
    );

    await expect(getPartPriceHistory(["part-1"])).resolves.toEqual([]);
  });

  it("still reports a genuine failure", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      clientReturning({
        data: null,
        error: { code: "57014", message: "canceling statement due to statement timeout" },
      }) as never,
    );

    await expect(getPartPriceHistory(["part-1"])).rejects.toThrow(/statement timeout/i);
  });

  it("returns the rows the database sent", async () => {
    const rows = [
      {
        id: 2,
        part_id: "part-1",
        old_price_cents: 7900,
        new_price_cents: 6400,
        changed_by: "u1",
        created_at: "2026-11-23T10:00:00.000Z",
        actor: { full_name: "Alex Reed" },
      },
    ];
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      clientReturning({ data: rows, error: null }) as never,
    );

    await expect(getPartPriceHistory(["part-1"])).resolves.toEqual(rows);
  });
});
