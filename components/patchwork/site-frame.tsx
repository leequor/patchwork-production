import Link from "next/link";

import { BackLink } from "@/components/patchwork/back-link";
import { Logo } from "@/components/ui/logo";
import { APP_NAME } from "@/lib/config";
import { cn } from "@/lib/utils";

/**
 * The public frame.
 *
 * A borderless nav over the artwork: mark on the left, the three things a
 * customer might actually want in the middle, and one high-contrast pill on the
 * right. No bar, no rule, no drop shadow — the artwork runs under all of it, so
 * a frame would only draw a box around the page.
 */

const NAV = [
  { href: "/track#stages", label: "How it works" },
  { href: "/status", label: "Status" },
  { href: "/track", label: "Track a repair" },
];

export function SiteHeader({
  action,
  back,
  showSignIn = true,
  className,
}: {
  /** The single right-hand control for this page. */
  action?: { href: string; label: string };
  /** The way out. Falls back to history when the caller has no route to offer. */
  back?: { href: string; label: string };
  /** Hide when the primary action already takes the visitor to sign in. */
  showSignIn?: boolean;
  className?: string;
}) {
  return (
    <header className={cn("flex items-center justify-between gap-6", className)}>
      <div className="flex min-w-0 items-center gap-3">
        <Logo />
        {back ? (
          <>
            <span aria-hidden="true" className="hidden h-4 w-px bg-hairline-strong sm:block" />
            <BackLink
              label={back.label}
              fallbackHref={back.href}
              className="hidden sm:inline-flex"
            />
          </>
        ) : null}
      </div>

      <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="tap font-sans text-[14px] text-ink-secondary transition-colors duration-150 hover:text-ink"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex shrink-0 items-center gap-4">
        {showSignIn ? (
          <Link
            href="/login"
            className="tap hidden font-sans text-[14px] text-ink-secondary transition-colors hover:text-ink sm:block"
          >
            Sign in
          </Link>
        ) : null}
        <Link
          href={action?.href ?? "/track"}
          className="inline-flex h-9 items-center rounded-full bg-ink px-4 font-sans text-[13px] font-medium text-canvas transition-transform duration-150 hover:-translate-y-px active:translate-y-0"
        >
          {action?.label ?? "Track a repair"}
        </Link>
      </div>
    </header>
  );
}

const FOOTER_COLUMNS = [
  {
    title: "Customers",
    links: [
      { href: "/track", label: "Track a repair" },
      { href: "/track#stages", label: "How it works" },
      { href: "/status", label: "System status" },
    ],
  },
  {
    title: "The shop",
    links: [
      { href: "/login", label: "Staff sign in" },
      { href: "/register", label: "Join the team" },
      { href: "/login", label: "The bench" },
    ],
  },
  {
    title: "Operations",
    links: [
      { href: "/inventory", label: "Inventory" },
      { href: "/tickets", label: "Tickets" },
      { href: "/invoices", label: "Invoices" },
    ],
  },
];

export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("mt-16 border-t border-hairline/70 pt-10 sm:mt-20", className)}>
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_repeat(3,minmax(0,1fr))] lg:gap-12">
        <div>
          <p className="display text-[28px] text-ink">{APP_NAME}</p>
          <p className="mt-3 max-w-[34ch] font-sans text-[14px] leading-6 text-ink-tertiary">
            Repair operations for devices that matter. Every ticket tracked from the intake counter
            to the moment it goes home.
          </p>
          <p className="eyebrow mt-6">Open Mon–Sat</p>
        </div>

        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title}>
            <p className="font-sans text-[13px] font-medium text-ink">{column.title}</p>
            <ul className="mt-4 space-y-3">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="tap font-sans text-[14px] text-ink-tertiary transition-colors duration-150 hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-14 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-hairline/60 py-6">
        <p className="font-mono text-2xs uppercase tracking-[0.16em] text-ink-faint">
          {APP_NAME} · Repair operations
        </p>
        <p className="font-sans text-[13px] text-ink-tertiary">
          Customers see status only. Staff manage the rest.
        </p>
      </div>
    </footer>
  );
}
