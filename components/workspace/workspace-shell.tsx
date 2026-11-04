"use client";

import {
  ChevronDown,
  ExternalLink,
  LogOut,
  Menu,
  Plus,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { logoutAction } from "@/app/actions/auth";
import { Logo } from "@/components/ui/logo";
import type { AuthUser } from "@/lib/auth/types";
import { ROLE_LABELS } from "@/lib/repair/format";
import { cn, initials } from "@/lib/utils";

import { CommandPalette } from "./command-palette";
import { NAV_ITEMS, isActivePath } from "./nav";
import { PageTransition } from "./page-transition";

/**
 * The console shell. A 72px instrument rail that widens on hover or focus,
 * a floating glass header, and a main region that goes full-bleed for the
 * Mission Control workspace.
 */
export function WorkspaceShell({
  user,
  children,
}: {
  user: AuthUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const displayName = user.fullName || user.email;
  const avatar = initials(displayName) || "PW";
  const section = NAV_ITEMS.find((item) => isActivePath(pathname, item.href)) ?? NAV_ITEMS[0];
  const isMissionControl = pathname === "/";

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!profileOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [profileOpen]);

  function renderRail(forceLabels: boolean, onNavigate?: () => void) {
    const label = forceLabels
      ? "opacity-100"
      : "opacity-0 transition-opacity duration-200 group-hover/rail:opacity-100 group-focus-within/rail:opacity-100";

    return (
      <div className="flex h-full w-[248px] flex-col p-3">
        <div className="flex h-12 items-center">
          <span className="grid h-12 w-12 shrink-0 place-items-center">
            <Logo href="/" markOnly />
          </span>
          <span
            className={cn(
              "display relative z-10 min-w-0 truncate pl-1 pr-3 text-[15px] text-ink",
              label,
            )}
          >
            Patchwork
          </span>
        </div>

        <Link
          href="/tickets/new"
          onClick={onNavigate}
          className="mt-4 flex h-10 items-center overflow-hidden rounded-xl bg-accent-fill text-[13px] font-semibold text-white shadow-inset-line transition duration-150 hover:brightness-110 active:scale-[0.985]"
        >
          <span className="grid h-10 w-12 shrink-0 place-items-center">
            <Plus className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
          </span>
          <span className={cn("relative z-10 min-w-0 truncate pr-3", label)}>New intake</span>
        </Link>

        <nav aria-label="Main navigation" className="mt-5 flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-11 items-center rounded-xl text-[13px] font-medium transition-colors duration-150",
                  active
                    ? "bg-raised text-ink shadow-inset-line"
                    : "text-ink-tertiary hover:bg-raised/60 hover:text-ink",
                )}
              >
                {active ? (
                  <span
                    aria-hidden="true"
                    className="absolute -left-3 top-1/2 z-10 h-5 w-[2px] -translate-y-1/2 rounded-full bg-accent-lit"
                  />
                ) : null}
                <span className="grid h-11 w-12 shrink-0 place-items-center">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <span className={cn("relative z-10 min-w-0 truncate pr-3", label)}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-1 pt-4">
          <Link
            href="/track"
            onClick={onNavigate}
            className="flex h-10 items-center overflow-hidden rounded-xl text-[12px] text-ink-tertiary transition-colors duration-150 hover:bg-raised/60 hover:text-ink"
          >
            <span className="grid h-10 w-12 shrink-0 place-items-center">
              <ExternalLink className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
            </span>
            <span className={cn("relative z-10 min-w-0 truncate pr-3", label)}>
              Public tracker
            </span>
          </Link>

          <div className="mt-2 flex items-center overflow-hidden rounded-xl border border-hairline bg-panel/50">
            <span className="grid h-12 w-12 shrink-0 place-items-center">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent-soft text-[11px] font-semibold text-accent-bright">
                {avatar}
              </span>
            </span>
            <div className={cn("relative z-10 min-w-0 flex-1 pr-2", label)}>
              <p className="truncate text-[12px] font-medium text-ink">{displayName}</p>
              <p className="truncate text-[11px] text-ink-tertiary">
                {ROLE_LABELS[user.role]} · {user.email}
              </p>
            </div>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              aria-label="Log out"
              title="Log out"
              className="flex h-10 w-full items-center overflow-hidden rounded-xl text-[12px] text-ink-tertiary transition-colors duration-150 hover:bg-raised/60 hover:text-ink"
            >
              <span className="grid h-10 w-12 shrink-0 place-items-center">
                <LogOut className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
              </span>
              <span className={cn("relative z-10 min-w-0 truncate pr-3", label)}>Log out</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh]">
      <aside
        aria-label="Workspace"
        className="group/rail fixed inset-y-0 left-0 z-50 isolate hidden w-[72px] overflow-hidden border-r border-hairline bg-canvas transition-[width] duration-300 ease-spring will-change-[width] hover:w-[248px] focus-within:w-[248px] lg:block"
      >
        {renderRail(false)}
      </aside>

      <div className="lg:pl-[72px]">
        <header className="sticky top-0 z-30 px-3 pt-3 sm:px-4">
          <div className="flex h-14 items-center gap-2 rounded-xl border border-hairline bg-panel/55 px-2.5 shadow-panel backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink-tertiary transition-colors hover:bg-raised hover:text-ink lg:hidden"
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
            </button>

            <div className="min-w-0 flex-1 pl-1">
              <p className="truncate text-[13px] font-semibold text-ink">{section.label}</p>
              <p className="hidden truncate text-[11px] text-ink-tertiary sm:block">
                {section.short}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              aria-label="Search Patchwork (Command K)"
              className="flex h-9 w-[150px] shrink-0 items-center gap-2 rounded-lg border border-hairline bg-canvas/50 px-2.5 text-left text-[12px] text-ink-tertiary transition-colors duration-150 hover:border-hairline-strong hover:text-ink sm:w-[220px] lg:w-[300px]"
            >
              <Search className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="hidden truncate sm:block">Search…</span>
              <kbd className="ml-auto hidden rounded border border-hairline bg-raised px-1.5 py-0.5 font-mono text-[10px] text-ink-faint sm:block">
                ⌘K
              </kbd>
            </button>

            <Link
              href="/tickets/new"
              className="hidden h-9 shrink-0 items-center gap-2 rounded-lg bg-accent-fill px-3 text-[12px] font-semibold text-white transition duration-150 hover:brightness-110 active:scale-[0.985] sm:flex"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden="true" />
              New intake
            </Link>

            <div className="relative shrink-0" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((open) => !open)}
                aria-label="Open profile menu"
                aria-expanded={profileOpen}
                className="flex h-9 items-center gap-2 rounded-lg border border-hairline bg-raised/70 pl-1 pr-2 transition-colors duration-150 hover:bg-raised"
              >
                <span className="grid h-7 w-7 place-items-center rounded-md bg-accent-soft text-[10px] font-semibold text-accent-bright">
                  {avatar}
                </span>
                <span className="hidden max-w-[120px] truncate text-[12px] text-ink lg:block">
                  {displayName}
                </span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 text-ink-tertiary transition-transform duration-200",
                    profileOpen && "rotate-180",
                  )}
                  aria-hidden="true"
                />
              </button>

              {profileOpen ? (
                <div
                  role="menu"
                  aria-label="Profile"
                  className="absolute right-0 top-[calc(100%+8px)] z-40 w-64 overflow-hidden rounded-xl border border-hairline-strong bg-panel/95 shadow-float backdrop-blur-2xl"
                >
                  <div className="border-b border-hairline px-3.5 py-3">
                    <p className="truncate text-[12px] font-medium text-ink">{displayName}</p>
                    <p className="mt-0.5 truncate text-[11px] text-ink-tertiary">
                      {ROLE_LABELS[user.role]} · {user.email}
                    </p>
                  </div>
                  <div className="p-1.5">
                    <Link
                      href="/track"
                      role="menuitem"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] text-ink-secondary transition-colors hover:bg-raised hover:text-ink"
                    >
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      Public tracker
                    </Link>
                    <form action={logoutAction}>
                      <button
                        type="submit"
                        role="menuitem"
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12px] text-ink-secondary transition-colors hover:bg-raised hover:text-ink"
                      >
                        <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                        Log out
                      </button>
                    </form>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main
          className={
            isMissionControl
              ? "h-[calc(100dvh-80px)] overflow-hidden px-3 pb-3 sm:px-4 sm:pb-4"
              : "mx-auto w-full max-w-canvas px-4 pb-24 pt-6 sm:px-6"
          }
        >
          <PageTransition fullHeight={isMissionControl}>{children}</PageTransition>
        </main>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label="Close navigation overlay"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-canvas/75 backdrop-blur-sm"
          />
          <aside className="absolute inset-y-0 left-0 w-[248px] border-r border-hairline bg-canvas shadow-float">
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
              className="absolute right-2 top-3 z-10 grid h-9 w-9 place-items-center rounded-lg text-ink-tertiary hover:bg-raised hover:text-ink"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
            {renderRail(true, () => setMobileOpen(false))}
          </aside>
        </div>
      ) : null}

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
