"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { logoutAction } from "@/app/actions/auth";
import { Logo } from "@/components/ui/logo";
import type { AuthUser } from "@/lib/auth/types";
import { ROLE_LABELS } from "@/lib/repair/format";
import { initials } from "@/lib/utils";

import {
  ArrowUpRightIcon,
  CloseIcon,
  CustomersIcon,
  DashboardIcon,
  InventoryIcon,
  InvoiceIcon,
  LogoutIcon,
  MenuIcon,
  PlusIcon,
  SearchIcon,
  TeamIcon,
  TicketIcon,
} from "./icons";

const NAV = [
  { href: "/", label: "Overview", icon: DashboardIcon },
  { href: "/tickets", label: "Tickets", icon: TicketIcon },
  { href: "/customers", label: "Customers", icon: CustomersIcon },
  { href: "/inventory", label: "Inventory", icon: InventoryIcon },
  { href: "/invoices", label: "Invoices", icon: InvoiceIcon },
  { href: "/team", label: "Team", icon: TeamIcon },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function pageTitle(pathname: string) {
  if (pathname === "/") return "Overview";
  if (pathname.startsWith("/tickets")) return "Tickets";
  if (pathname.startsWith("/customers")) return "Customers";
  if (pathname.startsWith("/inventory")) return "Inventory";
  if (pathname.startsWith("/invoices")) return "Invoices";
  if (pathname.startsWith("/team")) return "Team";
  return "Patchwork";
}

export function WorkspaceShell({
  user,
  children,
}: {
  user: AuthUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const displayName = user.fullName || user.email;
  const avatar = initials(displayName) || "PW";

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center justify-between px-4">
        <div onClick={() => setOpen(false)}>
          <Logo />
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="grid h-8 w-8 place-items-center rounded text-muted hover:bg-wash hover:text-ink lg:hidden"
          aria-label="Close navigation"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="px-3 pt-2">
        <Link
          href="/tickets/new"
          onClick={() => setOpen(false)}
          className="flex h-8 items-center justify-center gap-1.5 rounded bg-accent px-3 text-[13px] font-semibold text-paper transition-colors hover:bg-gold"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          New ticket
        </Link>
      </div>

      <nav className="mt-4 flex-1 space-y-0.5 px-2" aria-label="Main navigation">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={
                active
                  ? "flex h-8 items-center gap-2.5 rounded bg-wash px-2.5 text-[13px] font-medium text-ink"
                  : "flex h-8 items-center gap-2.5 rounded px-2.5 text-[13px] text-muted transition-colors hover:bg-wash/60 hover:text-ink"
              }
              aria-current={active ? "page" : undefined}
            >
              <Icon className={active ? "h-4 w-4 text-accent" : "h-4 w-4"} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 pb-2">
        <Link
          href="/track"
          onClick={() => setOpen(false)}
          className="flex h-8 items-center justify-between rounded px-2.5 text-[13px] text-muted transition-colors hover:bg-wash/60 hover:text-ink"
        >
          Public tracker
          <ArrowUpRightIcon className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="bg-raised p-3">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded bg-wash text-[11.5px] font-semibold tracking-wide text-ink">
            {avatar}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-ink">{displayName}</p>
            <p className="mt-0.5 truncate text-[11.5px] text-muted">
              {ROLE_LABELS[user.role]} · {user.email}
            </p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="grid h-7 w-7 place-items-center rounded text-muted transition-colors hover:bg-wash hover:text-ink"
              aria-label="Log out"
              title="Log out"
            >
              <LogoutIcon className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-paper">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[232px] bg-surface lg:block">
        {sidebar}
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close navigation overlay"
            onClick={() => setOpen(false)}
          />
          {/* taste-skill-ignore shadow: the mobile drawer is a real overlay */}
          <aside className="absolute inset-y-0 left-0 w-[260px] bg-surface ring-1 ring-line">{sidebar}</aside>
        </div>
      ) : null}

      <div className="lg:pl-[232px]">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 bg-paper px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="grid h-8 w-8 place-items-center rounded bg-wash text-muted hover:text-ink lg:hidden"
            aria-label="Open navigation"
          >
            <MenuIcon className="h-4 w-4" />
          </button>

          <p className="hidden text-[13px] text-muted sm:block">{pageTitle(pathname)}</p>

          <form action="/tickets" className="ml-auto hidden w-full max-w-[280px] items-center md:flex">
            <label className="relative flex w-full items-center">
              <SearchIcon className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-muted" />
              <span className="sr-only">Search tickets</span>
              <input
                name="q"
                type="search"
                placeholder="Search tickets or customers"
                className="h-8 w-full rounded border border-line bg-surface pl-8 pr-2.5 text-[13px] text-ink outline-none placeholder:text-muted/70 focus:border-accent"
              />
            </label>
          </form>

          <form action={logoutAction} className="lg:hidden">
            <button
              type="submit"
              className="grid h-8 w-8 place-items-center rounded bg-wash text-muted hover:text-ink"
              aria-label="Log out"
              title="Log out"
            >
              <LogoutIcon className="h-4 w-4" />
            </button>
          </form>
        </header>

        <main className="mx-auto w-full max-w-[1180px] px-4 pb-16 pt-4 sm:px-6 sm:pt-6">{children}</main>
      </div>
    </div>
  );
}
