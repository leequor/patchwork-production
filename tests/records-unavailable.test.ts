import { describe, expect, it } from "vitest";

import { isRecordsUnavailable, RecordsUnavailableError } from "@/lib/repair/queries";

/**
 * The distinction this exists for: a customer's tracker must never say "no
 * repair matches that code" when the truth is "the database is down". Those two
 * facts look the same from inside a thrown error, and they are completely
 * different to the person reading the screen.
 */
describe("isRecordsUnavailable", () => {
  it("recognises the transport failures a real outage produces", () => {
    for (const message of [
      "TypeError: fetch failed",
      "connect ETIMEDOUT 10.0.0.1:5432",
      "connect ECONNREFUSED 127.0.0.1:54321",
      "getaddrinfo ENOTFOUND db.example.supabase.co",
      "socket hang up",
    ]) {
      expect(isRecordsUnavailable(new Error(message)), message).toBe(true);
    }
  });

  it("recognises its own error type", () => {
    expect(isRecordsUnavailable(new RecordsUnavailableError())).toBe(true);
  });

  it("does not swallow real faults", () => {
    expect(isRecordsUnavailable(new Error('column "unit_price_cents" does not exist'))).toBe(false);
    expect(isRecordsUnavailable(new Error("permission denied for table parts"))).toBe(false);
    expect(isRecordsUnavailable("something else entirely")).toBe(false);
  });

  it("keeps the original cause for the server log", () => {
    const cause = new Error("fetch failed");
    expect(new RecordsUnavailableError(cause).cause).toBe(cause);
  });
});
