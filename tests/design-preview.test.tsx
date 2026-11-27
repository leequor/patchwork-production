import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DesignPreviewContent, isSupportedPreviewSection } from "@/components/workspace/design-preview-pages";
import { previewHref, previewPathname } from "@/lib/preview/navigation";

describe("read-only workspace previews", () => {
  it.each([
    ["tickets", "Tickets"],
    ["customers", "Customers"],
    ["inventory", "Inventory"],
    ["invoices", "Invoices"],
    ["team", "Team"],
    ["tickets/new", "New intake"],
    ["customers/new", "New customer"],
    ["tickets/preview-ticket-1", "PW-1041"],
    ["customers/preview-customer-1", "Maya Ferreira"],
  ])("renders %s using fixtures and keeps workspace links in the preview", (section, heading) => {
    expect(isSupportedPreviewSection(section)).toBe(true);
    const { container } = render(<DesignPreviewContent section={section} />);
    expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
    expect(screen.getByText(/fixture data · preview only/i)).toBeInTheDocument();
    expect(container.querySelector("form[action]")).toBeNull();
    for (const input of container.querySelectorAll("input")) expect(input).toHaveAttribute("readonly");
    for (const button of container.querySelectorAll("button")) expect(button).toBeDisabled();
    for (const link of container.querySelectorAll("a[href]")) {
      expect(link.getAttribute("href")).toMatch(/^\/(?:design-preview\/|track$)/);
    }
  });

  it.each(["unknown", "tickets/preview-ticket-999", "customers/preview-customer-999"])("rejects unknown section %s", section => {
    expect(isSupportedPreviewSection(section)).toBe(false);
    render(<DesignPreviewContent section={section} />);
    expect(screen.getByText(/preview (?:page|ticket|customer) unavailable/i)).toBeInTheDocument();
  });

  it("preserves search text and normalizes preview navigation without changing real routes", () => {
    expect(previewHref("/tickets?q=screen%20repair")).toBe("/design-preview/tickets?q=screen%20repair");
    expect(previewHref("/")).toBe("/design-preview/workspace");
    expect(previewPathname("/design-preview/workspace")).toBe("/");
    expect(previewPathname("/design-preview/tickets/new")).toBe("/tickets/new");
    expect(previewPathname("/tickets")).toBe("/tickets");
    expect(previewPathname("/design-previews/tickets")).toBe("/design-previews/tickets");
  });
});
