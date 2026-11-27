import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const { push, currentPath } = vi.hoisted(() => ({
  push: vi.fn(),
  currentPath: { value: "/tickets" },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => currentPath.value,
  useRouter: () => ({ push }),
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

  it("keeps local preview navigation on fixture routes and hides sign-out", () => {
    currentPath.value = "/design-preview/tickets";

    render(
      <WorkspaceShell user={user} preview>
        <p>Page body</p>
      </WorkspaceShell>,
    );

    expect(screen.getAllByRole("link", { name: "Tickets" })[0]).toHaveAttribute(
      "href",
      "/design-preview/tickets",
    );
    expect(screen.getAllByRole("link", { name: "Tickets" })[0]).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getAllByRole("link", { name: "Patchwork home" })[0]).toHaveAttribute(
      "href",
      "/design-preview/workspace",
    );
    expect(screen.getAllByText(/sample data/i).length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: "Log out" })).not.toBeInTheDocument();

    currentPath.value = "/tickets";
  });

  it.each([
    ["link", "Mission control"],
    ["link", "Tickets"],
    ["link", "Customers"],
    ["link", "Inventory"],
    ["link", "Invoices"],
    ["link", "Team"],
    ["link", "New intake"],
    ["link", "Public tracker"],
    ["link", "Patchwork home"],
    ["button", "Log out"],
  ])("collapses after a mouse click on %s %s and moving away without another click", async (role, name) => {
    const browser = userEvent.setup();
    render(<WorkspaceShell user={user}><button type="button">Outside the sidebar</button></WorkspaceShell>);
    const rail = screen.getByRole("complementary", { name: "Workspace" });
    const collapsed = rail.style.clipPath;
    const control = within(rail).getByRole(role, { name });
    control.addEventListener("click", event => event.preventDefault());

    await browser.click(control);
    expect(control).toHaveFocus();
    expect(rail.style.clipPath).not.toBe(collapsed);
    await browser.hover(screen.getByRole("button", { name: "Outside the sidebar" }));

    await waitFor(() => expect(rail.style.clipPath).toBe(collapsed));
    expect(control).toHaveFocus();
  });

  it("keeps keyboard navigation expanded after switching from a mouse click to Tab", async () => {
    const browser = userEvent.setup();
    render(<WorkspaceShell user={user}><button type="button">Outside the sidebar</button></WorkspaceShell>);
    const rail = screen.getByRole("complementary", { name: "Workspace" });
    const collapsed = rail.style.clipPath;
    const tickets = within(rail).getByRole("link", { name: "Tickets" });
    tickets.addEventListener("click", event => event.preventDefault());
    await browser.click(tickets);
    await browser.tab();
    expect(within(rail).getByRole("link", { name: "Customers" })).toHaveFocus();
    const expanded = rail.style.clipPath;
    const outside = screen.getByRole("button", { name: "Outside the sidebar" });
    await browser.hover(outside);
    await new Promise(resolve => setTimeout(resolve, 400));
    expect(rail.style.clipPath).toBe(expanded);
    outside.focus();
    await waitFor(() => expect(rail.style.clipPath).toBe(collapsed));
  });

  it("cancels a pending close when the pointer returns to the sidebar", async () => {
    const browser = userEvent.setup();
    render(<WorkspaceShell user={user}><button type="button">Outside the sidebar</button></WorkspaceShell>);
    const rail = screen.getByRole("complementary", { name: "Workspace" });
    const collapsed = rail.style.clipPath;
    const tickets = within(rail).getByRole("link", { name: "Tickets" });
    tickets.addEventListener("click", event => event.preventDefault());
    await browser.click(tickets);
    const expanded = rail.style.clipPath;
    const outside = screen.getByRole("button", { name: "Outside the sidebar" });
    await browser.hover(outside);
    await browser.hover(rail);
    await new Promise(resolve => setTimeout(resolve, 400));
    expect(rail.style.clipPath).toBe(expanded);
    await browser.hover(outside);
    await waitFor(() => expect(rail.style.clipPath).toBe(collapsed));
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

  it("keeps palette focus in the search and restores it on close", async () => {
    render(
      <WorkspaceShell user={user}>
        <p>Page body</p>
      </WorkspaceShell>,
    );

    const trigger = screen.getByRole("button", { name: /Search Patchwork/ });
    trigger.focus();
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });

    const input = await screen.findByRole("combobox", { name: "Search Patchwork" });
    await waitFor(() => expect(input).toHaveFocus());
    expect(input).toHaveAttribute("aria-activedescendant", expect.any(String));

    fireEvent.keyDown(input, { key: "ArrowDown" });
    const options = screen.getAllByRole("option");
    expect(options[1]).toHaveAttribute("aria-selected", "true");
    expect(input).toHaveAttribute("aria-activedescendant", options[1].id);

    fireEvent.keyDown(input, { key: "Tab" });
    expect(input).toHaveFocus();
    fireEvent.keyDown(input, { key: "Escape" });
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("opens and closes mobile navigation", async () => {
    const browser = userEvent.setup();
    render(
      <WorkspaceShell user={user}>
        <p>Page body</p>
      </WorkspaceShell>,
    );

    const trigger = screen.getByRole("button", { name: "Open navigation" });
    await browser.click(trigger);
    const drawer = screen.getByRole("dialog", { name: "Workspace navigation" });
    const close = screen.getByRole("button", { name: "Close navigation" });
    expect(drawer).toBeInTheDocument();
    expect(close).toHaveFocus();
    expect(document.body.style.overflow).toBe("hidden");
    await browser.keyboard("{Shift>}{Tab}{/Shift}");
    expect(within(drawer).getByRole("button", { name: "Log out" })).toHaveFocus();
    await browser.keyboard("{Tab}");
    expect(close).toHaveFocus();
    await browser.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Workspace navigation" })).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
      expect(document.body.style.overflow).toBe("");
    });
  });

  it("closes the profile popover with Escape and returns focus", async () => {
    const browser = userEvent.setup();
    render(
      <WorkspaceShell user={user}>
        <p>Page body</p>
      </WorkspaceShell>,
    );

    const trigger = screen.getByRole("button", { name: "Open profile options" });
    await browser.click(trigger);
    const menu = document.getElementById("profile-menu");
    expect(menu).not.toBeNull();
    expect(within(menu as HTMLElement).getByRole("link", { name: "Public tracker" })).toHaveAttribute(
      "href",
      "/track",
    );
    await browser.keyboard("{Escape}");
    await waitFor(() => {
      expect(document.getElementById("profile-menu")).toBeNull();
      expect(screen.getByRole("button", { name: "Open profile options" })).toHaveFocus();
    });
  });
});
