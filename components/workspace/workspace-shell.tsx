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

/**
 * The desk, turned from poster to paper. The ink rail holds the shop's name and
 * the six places work lives; the paper field is the ledger everything is
 * written on.
 */
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
    <div className="flex h-full flex-col bg-night">
      <div className="flex h-16 items-center justify-between px-4">
        <div onClick={() => setOpen(false)}>
          <Logo tone="night" />
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="grid h-9 w-9 place-items-center rounded-sm text-creamMuted hover:bg-nightRaised hover:text-cream lg:hidden"
          aria-label="Close navigation"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="px-3 pt-3">
        <Link
          href="/tickets/new"
          onClick={() => setOpen(false)}
          className="flex h-11 items-center justify-center gap-2 rounded-sm bg-accent px-3 font-sans text-[14px] font-semibold text-onAccent transition-[background-color,transform] duration-150 hover:bg-gold active:scale-[0.98]"
        >
          <PlusIcon className="h-4 w-4" />
          New ticket
        </Link>
      </div>

      <nav className="mt-6 flex-1 space-y-1 px-3" aria-label="Main navigation">
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
                  ? "flex h-10 items-center gap-3 rounded-sm bg-nightRaised px-2.5 font-sans text-[14px] font-medium text-cream"
                  : "flex h-10 items-center gap-3 rounded-sm px-2.5 font-sans text-[14px] text-creamMuted transition-colors duration-150 hover:bg-nightPanel hover:text-cream"
              }
              aria-current={active ? "page" : undefined}
            >
              <span
                aria-hidden="true"
                className={active ? "h-2 w-2 bg-accent" : "h-2 w-2 bg-nightLine"}
              />
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-3">
        <Link
          href="/track"
          onClick={() => setOpen(false)}
          className="flex h-10 items-center justify-between rounded-sm px-2.5 font-sans text-[13px] text-creamMuted transition-colors hover:bg-nightPanel hover:text-cream"
        >
          Public tracker
          <ArrowUpRightIcon className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="bg-nightPanel p-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-sm bg-nightRaised font-sans text-[13px] font-semibold text-cream">
            {avatar}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-sans text-[13px] font-medium text-cream">{displayName}</p>
            <p className="mt-0.5 truncate font-sans text-[13px] text-creamMuted">
              {ROLE_LABELS[user.role]} · {user.email}
            </p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="grid h-9 w-9 place-items-center rounded-sm text-creamMuted transition-colors hover:bg-nightRaised hover:text-cream"
              aria-label="Log out"
              title="Log out"
            >
              <LogoutIcon className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-paper">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[240px] lg:block">{sidebar}</aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-night/70"
            aria-label="Close navigation overlay"
            onClick={() => setOpen(false)}
          />
          {/* taste-skill-ignore shadow: the mobile drawer is a real overlay */}
          <aside className="absolute inset-y-0 left-0 w-[268px]">{sidebar}</aside>
        </div>
      ) : null}

      <div className="lg:pl-[240px]">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-paper px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-sm bg-wash text-muted hover:text-ink lg:hidden"
            aria-label="Open navigation"
          >
            <MenuIcon className="h-4 w-4" />
          </button>

          <form action="/tickets" className="ml-auto hidden w-full max-w-[300px] items-center md:flex">
            <label className="relative flex w-full items-center">
              <SearchIcon className="pointer-events-none absolute left-2.5 h-4 w-4 text-muted" />
              <span className="sr-only">Search tickets</span>
              <input
                name="q"
                type="search"
                placeholder="Ticket, customer, device"
                className="h-10 w-full rounded-sm border border-line bg-surface pl-8 pr-2.5 font-serif text-[15px] text-ink outline-none placeholder:text-muted/70 focus:border-accent"
              />
            </label>
          </form>

          <form action={logoutAction} className="lg:hidden">
            <button
              type="submit"
              className="grid h-10 w-10 place-items-center rounded-sm bg-wash text-muted hover:text-ink"
              aria-label="Log out"
              title="Log out"
            >
              <LogoutIcon className="h-4 w-4" />
            </button>
          </form>
        </header>

        <main className="mx-auto w-full max-w-canvas px-4 pb-20 pt-6 sm:px-6 sm:pt-8">{children}</main>
      </div>
    </div>
  );
}
