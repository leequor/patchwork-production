import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/tickets",
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/app/actions/auth", () => ({
  logoutAction: vi.fn(),
}));

import { WorkspaceShell } from "@/components/workspace/workspace-shell";

const user = {
  id: "user-1",
  email: "alex@luckypatcher.test",
  role: "superadmin" as const,
  fullName: "Alex Campita",
  createdAt: "2026-10-19T11:10:00.000Z",
};

describe("WorkspaceShell", () => {
  it("renders the product, navigation, identity, and logout", () => {
    render(
      <WorkspaceShell user={user}>
        <p>Page body</p>
      </WorkspaceShell>,
    );

    expect(screen.getAllByText("Patchwork").length).toBeGreaterThan(0);
    expect(screen.getByText("Page body")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Tickets" }).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Alex Campita").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Owner ·/).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "Log out" }).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Public tracker" })).toHaveAttribute("href", "/track");
    expect(screen.getByRole("link", { name: "Tickets" })).toHaveAttribute("aria-current", "page");
  });

  it("opens the command palette from the keyboard and closes it with escape", async () => {
    render(
      <WorkspaceShell user={user}>
        <p>Page body</p>
      </WorkspaceShell>,
    );

    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    expect(await screen.findByRole("dialog", { name: "Search Patchwork" })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Search Patchwork" })).not.toBeInTheDocument();
  });

  it("opens and closes mobile navigation", async () => {
    const browser = userEvent.setup();
    render(
      <WorkspaceShell user={user}>
        <p>Page body</p>
      </WorkspaceShell>,
    );

    await browser.click(screen.getByRole("button", { name: "Open navigation" }));
    expect(screen.getByRole("button", { name: "Close navigation overlay" })).toBeInTheDocument();
    await browser.click(screen.getByRole("button", { name: "Close navigation overlay" }));
    expect(
      screen.queryByRole("button", { name: "Close navigation overlay" }),
    ).not.toBeInTheDocument();
  });
});
