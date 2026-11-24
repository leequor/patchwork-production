import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/repair/queries", () => ({
  getTrackedTicket: vi.fn(),
  isRecordsUnavailable: (error: unknown) =>
    /records|fetch failed|etimedout/i.test(String((error as Error)?.message ?? error)),
}));

import TrackPage from "@/app/track/page";
import { getTrackedTicket } from "@/lib/repair/queries";

const tracked = {
  ticket_number: "PW-1041",
  status: "in_repair",
  issue: "Screen cracked after a drop.",
  created_at: "2026-10-27T10:00:00.000Z",
  updated_at: "2026-10-27T10:00:00.000Z",
  completed_at: null,
  customer_name: "Maya",
  device: { category: "phone", brand: "Apple", model: "iPhone 15 Pro" },
  events: [
    {
      status: "in_repair",
      body: "Status moved to in repair.",
      created_at: "2026-10-27T10:00:00.000Z",
    },
  ],
};

describe("TrackPage", () => {
  it("renders the tracking form before a lookup", async () => {
    render(await TrackPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("heading", { name: "Where is my repair?" })).toBeInTheDocument();
    expect(screen.getByLabelText("Tracking code")).toBeInTheDocument();
    expect(screen.queryByLabelText("Email or phone")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Intake. Diagnose. Repair." })).toBeInTheDocument();
    expect(vi.mocked(getTrackedTicket)).not.toHaveBeenCalled();
  });

  it("renders a matched repair and timeline", async () => {
    vi.mocked(getTrackedTicket).mockResolvedValue(tracked as never);
    render(
      await TrackPage({
        searchParams: Promise.resolve({ code: "TRACK1041" }),
      }),
    );

    expect(screen.getAllByText("PW-1041").length).toBeGreaterThan(0);
    expect(screen.getByText("Apple iPhone 15 Pro")).toBeInTheDocument();
    expect(screen.getAllByText("In repair").length).toBeGreaterThan(0);
    expect(screen.getByText("Status moved to in repair.")).toBeInTheDocument();
    expect(screen.getByText(/Hi Maya/)).toBeInTheDocument();
  });

  it("says the records are unreachable instead of blaming the code", async () => {
    vi.mocked(getTrackedTicket).mockRejectedValue(new Error("fetch failed"));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      await TrackPage({
        searchParams: Promise.resolve({ code: "ABCDEFGHIJ" }),
      }),
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Records are unreachable");
    expect(alert).not.toHaveTextContent("No ticket matched that code");
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("still surfaces a real fault rather than hiding it", async () => {
    vi.mocked(getTrackedTicket).mockRejectedValue(new Error('column "x" does not exist'));
    await expect(
      TrackPage({ searchParams: Promise.resolve({ code: "ABCDEFGHIJ" }) }),
    ).rejects.toThrow('column "x" does not exist');
  });

  it("explains a failed lookup", async () => {
    vi.mocked(getTrackedTicket).mockResolvedValue(null);
    render(
      await TrackPage({
        searchParams: Promise.resolve({ code: "NOPE" }),
      }),
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "No ticket matched that code. Check the ten characters on the receipt.",
    );
  });
});
