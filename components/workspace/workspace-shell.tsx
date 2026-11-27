"use client";

import { AnimatePresence, motion } from "framer-motion";
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
import { useEffect, useRef, useState, type ReactNode } from "react";

import { logoutAction } from "@/app/actions/auth";
import { Logo } from "@/components/ui/logo";
import type { AuthUser } from "@/lib/auth/types";
import { previewHref, previewPathname } from "@/lib/preview/navigation";
import { ROLE_LABELS } from "@/lib/repair/format";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { cn, initials } from "@/lib/utils";

import { CommandPalette } from "./command-palette";
import { NAV_ITEMS, isActivePath } from "./nav";
import { PageTransition } from "./page-transition";

const RAIL_COLLAPSED = 72;
const RAIL_CLOSE_DELAY = 300;
const MOBILE_FOCUSABLE =
  'a[href], button:not([disabled]):not([tabindex="-1"]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * One label, two lives. Open, it staggers in with the rail. Closed, the same
 * words stay in the accessibility tree so an icon-only link never loses its
 * name — the rail can collapse visually without becoming a mystery.
 */
function RailLabel({
  show,
  children,
  className,
  delay = 0,
}: {
  show: boolean;
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = usePrefersReducedMotion();

  return (
    <>
      {show ? null : <div className="sr-only">{children}</div>}
      <AnimatePresence initial={false}>
        {show ? (
          <motion.div
            initial={reduced ? false : { opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, transition: { duration: 0 } }}
            transition={{
              duration: reduced ? 0 : 0.14,
              delay: reduced ? 0 : delay,
              ease: [0.22, 1, 0.36, 1],
            }}
            className={cn("relative z-10 min-w-0 truncate whitespace-nowrap", className)}
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

/**
 * The console shell. A 72px instrument rail that widens on hover or focus and
 * floats over the page instead of pushing it, a glass header, and a main
 * region that goes full-bleed for the Mission Control workspace.
 */
export function WorkspaceShell({
  user,
  children,
  preview = false,
}: {
  user: AuthUser;
  children: React.ReactNode;
  preview?: boolean;
}) {
  const pathname = usePathname();
  const activePathname = preview ? previewPathname(pathname) : pathname;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [railExpanded, setRailExpanded] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const profileTriggerRef = useRef<HTMLButtonElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const mobileDialogRef = useRef<HTMLDivElement>(null);
  const mobileCloseRef = useRef<HTMLButtonElement>(null);
  const railTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const railPointerFocus = useRef(false);

  const displayName = preview ? "Local preview" : user.fullName || user.email;
  const avatar = initials(displayName) || "PW";
  const section = NAV_ITEMS.find((item) => isActivePath(activePathname, item.href)) ?? NAV_ITEMS[0];
  const isMissionControl = activePathname === "/";
  const href = (path: string) => (preview ? previewHref(path) : path);

  const openRail = () => {
    if (railTimer.current) {
      clearTimeout(railTimer.current);
      railTimer.current = null;
    }
    setRailExpanded(true);
  };

  const closeRail = () => {
    if (railTimer.current) clearTimeout(railTimer.current);
    railTimer.current = setTimeout(() => setRailExpanded(false), RAIL_CLOSE_DELAY);
  };

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
    return () => {
      if (railTimer.current) clearTimeout(railTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!profileOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setProfileOpen(false);
      profileTriggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [profileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const fallbackFocus = mobileTriggerRef.current;
    document.body.style.overflow = "hidden";
    mobileCloseRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobileOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const dialog = mobileDialogRef.current;
      const focusable = dialog
        ? Array.from(dialog.querySelectorAll<HTMLElement>(MOBILE_FOCUSABLE))
        : [];
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!dialog?.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      (previousFocus ?? fallbackFocus)?.focus();
    };
  }, [mobileOpen]);

  function renderRail(forceLabels: boolean, onNavigate?: () => void) {
    const show = forceLabels || railExpanded;

    return (
      <div className="flex h-full w-[248px] flex-col p-3">
        <div className="flex h-12 items-center">
          <span className="grid h-12 w-12 shrink-0 place-items-center">
            <Logo href={href("/")} markOnly />
          </span>
          <RailLabel
            show={show}
            delay={0.02}
            className="display pl-1 pr-3 text-[15px] text-ink"
          >
            Patchwork
          </RailLabel>
        </div>

        <Link
          href={href("/tickets/new")}
          onClick={onNavigate}
          className={cn(
            "primary mt-4 flex h-9 items-center overflow-hidden rounded-sm text-[13px] font-semibold transition duration-150 hover:brightness-[1.06] active:translate-y-px",
            show ? "w-full" : "w-12",
          )}
        >
          <span className="grid h-9 w-12 shrink-0 place-items-center">
            <Plus className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
          </span>
          <RailLabel show={show} delay={0.05} className="pr-3">
            New intake
          </RailLabel>
        </Link>

        <nav aria-label="Main navigation" className="mt-5 flex flex-col gap-0.5">
          {NAV_ITEMS.map((item, index) => {
            const active = isActivePath(activePathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={href(item.href)}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-9 items-center rounded-sm text-[13px] font-medium transition-colors duration-150",
                  show ? "w-full" : "w-12",
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
                <span className="grid h-9 w-12 shrink-0 place-items-center">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <RailLabel show={show} delay={0.07 + index * 0.025} className="pr-3">
                  {item.label}
                </RailLabel>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-1 pt-4">
          <Link
            href="/track"
            onClick={onNavigate}
            className={cn(
              "flex h-9 items-center overflow-hidden rounded-sm text-[12px] text-ink-tertiary transition-colors duration-150 hover:bg-raised/60 hover:text-ink",
              show ? "w-full" : "w-12",
            )}
          >
            <span className="grid h-9 w-12 shrink-0 place-items-center">
              <ExternalLink className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
            </span>
            <RailLabel show={show} delay={0.11} className="pr-3">
              Public tracker
            </RailLabel>
          </Link>

          <div className="mt-2 flex items-center overflow-hidden rounded-sm bg-panel ring-1 ring-inset ring-white/[0.06]">
            <span className="grid h-12 w-12 shrink-0 place-items-center">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent-soft text-[11px] font-semibold text-accent-bright">
                {avatar}
              </span>
            </span>
            <RailLabel show={show} delay={0.13} className="flex-1 pr-2">
              <p className="truncate text-[12px] font-medium text-ink">{displayName}</p>
              {preview ? (
                <p className="truncate text-[11px] text-ink-tertiary">Sample data · read-only</p>
              ) : (
                <p className="truncate text-[11px] text-ink-tertiary">
                  {ROLE_LABELS[user.role]} · {user.email}
                </p>
              )}
            </RailLabel>
          </div>

          {preview ? null : (
            <form action={logoutAction}>
              <button
                type="submit"
                aria-label="Log out"
                title="Log out"
                className={cn(
                  "flex h-9 items-center overflow-hidden rounded-sm text-[12px] text-ink-tertiary transition-colors duration-150 hover:bg-raised/60 hover:text-ink",
                  show ? "w-full" : "w-12",
                )}
              >
                <span className="grid h-9 w-12 shrink-0 place-items-center">
                  <LogOut className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <RailLabel show={show} delay={0.15} className="pr-3">
                  Log out
                </RailLabel>
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh]">
      <aside
        aria-label="Workspace"
        onPointerDownCapture={() => {
          railPointerFocus.current = true;
        }}
        onKeyDownCapture={() => {
          railPointerFocus.current = false;
        }}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") openRail();
        }}
        onPointerLeave={(event) => {
          // A mouse click's retained focus must not pin the rail open. Keep it
          // expanded only when someone is navigating its controls by keyboard.
          if (
            event.pointerType === "mouse" &&
            (railPointerFocus.current || !event.currentTarget.contains(document.activeElement))
          ) {
            closeRail();
          }
        }}
        onFocusCapture={openRail}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            railPointerFocus.current = false;
            closeRail();
          }
        }}
        className={cn(
          "fixed inset-y-0 left-0 z-50 isolate hidden w-[248px] overflow-hidden border-r border-hairline bg-canvas/90 backdrop-blur-2xl transition-[clip-path,box-shadow] duration-200 ease-[var(--ease-out)] lg:block",
          railExpanded ? "shadow-[0_28px_70px_-24px_rgba(0,0,0,0.95)]" : "shadow-none",
        )}
        style={{
          clipPath: railExpanded
            ? "inset(0 0 0 0)"
            : `inset(0 calc(100% - ${RAIL_COLLAPSED}px) 0 0)`,
        }}
      >
        {renderRail(false)}
      </aside>

      <div className="lg:pl-[72px]">
        {/* A floating bar, not a boxed one: no panel edge anywhere, and the only
            line on it is a rule that fades at both ends. */}
        <header className="sticky top-0 z-30 bg-[linear-gradient(to_bottom,rgba(9,8,15,0.92),rgba(9,8,15,0.72)_62%,transparent)] px-3 pb-2 pt-3 backdrop-blur-xl sm:px-6">
          <div className="flex h-12 items-center gap-2">
            <button
              ref={mobileTriggerRef}
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-sm text-ink-tertiary transition-colors hover:bg-raised hover:text-ink lg:hidden"
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
            </button>

            <div className="min-w-0 flex-1 pl-1">
              <p className="hidden whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.16em] text-ink-tertiary sm:block">
                {preview ? "Local design preview · sample data" : section.label}
              </p>
              <p className="truncate text-[13px] font-medium text-ink">{section.short}</p>
            </div>

            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              aria-label="Search Patchwork (Command K)"
              className="flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-white/[0.03] text-left text-[12px] text-ink-tertiary ring-1 ring-inset ring-white/[0.07] transition-colors duration-150 hover:ring-white/[0.16] hover:text-ink sm:h-8 sm:w-[220px] sm:justify-start sm:px-3 lg:w-[300px]"
            >
              <Search className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="hidden truncate sm:block">Search…</span>
              <kbd className="ml-auto hidden rounded bg-white/[0.05] px-1.5 py-0.5 font-mono text-[10px] text-ink-faint sm:block">
                ⌘K
              </kbd>
            </button>

            <Link
              href={href("/tickets/new")}
              className="primary hidden h-8 shrink-0 items-center gap-2 rounded-full px-3.5 text-[12px] font-semibold transition duration-150 hover:brightness-[1.06] active:translate-y-px sm:flex"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden="true" />
              New intake
            </Link>

            <div className="relative shrink-0" ref={profileRef}>
              <button
                ref={profileTriggerRef}
                type="button"
                onClick={() => setProfileOpen((open) => !open)}
                id="profile-trigger"
                aria-label={profileOpen ? "Close profile options" : "Open profile options"}
                aria-expanded={profileOpen}
                aria-controls={profileOpen ? "profile-menu" : undefined}
                className="flex h-8 items-center gap-2 rounded-full bg-white/[0.03] pl-1 pr-2 ring-1 ring-inset ring-white/[0.07] transition-colors duration-150 hover:ring-white/[0.16]"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-accent-soft text-[10px] font-semibold text-accent-bright">
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
                  id="profile-menu"
                  role="group"
                  aria-labelledby="profile-trigger"
                  className="profile-popover absolute right-0 top-[calc(100%+8px)] z-40 w-64 overflow-hidden rounded-lg bg-panel/95 shadow-float ring-1 ring-inset ring-white/[0.08] backdrop-blur-xl"
                >
                  <div className="px-3.5 py-3">
                    <p className="truncate text-[12px] font-medium text-ink">{displayName}</p>
                    <p className="mt-0.5 truncate text-[11px] text-ink-tertiary">
                      {ROLE_LABELS[user.role]} · {user.email}
                    </p>
                  </div>
                  <div
                    aria-hidden="true"
                    className="mx-3.5 h-px bg-[linear-gradient(to_right,rgba(241,239,250,0.12),transparent)]"
                  />
                  <div className="p-1.5">
                    <Link
                      href="/track"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-[12px] text-ink-secondary transition-colors hover:bg-raised hover:text-ink"
                    >
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      Public tracker
                    </Link>
                    {preview ? null : (
                      <form action={logoutAction}>
                        <button
                          type="submit"
                          className="flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-left text-[12px] text-ink-secondary transition-colors hover:bg-raised hover:text-ink"
                        >
                          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                          Log out
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div
            aria-hidden="true"
            className="mt-2 h-px bg-[linear-gradient(to_right,transparent,rgba(241,239,250,0.10)_6%,rgba(241,239,250,0.10)_78%,transparent)]"
          />
        </header>

        <main
          className={
            isMissionControl
              ? "h-[calc(100dvh-68px)] overflow-hidden px-3 pb-3 sm:px-4 sm:pb-4"
              : "mx-auto w-full max-w-canvas px-4 pb-24 pt-6 sm:px-6"
          }
        >
          <PageTransition fullHeight={isMissionControl}>{children}</PageTransition>
        </main>
      </div>

      {mobileOpen ? (
        <div
          ref={mobileDialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Workspace navigation"
          className="fixed inset-0 z-[60] lg:hidden"
        >
          <button
            type="button"
            aria-label="Close navigation overlay"
            tabIndex={-1}
            onClick={() => setMobileOpen(false)}
            className="mobile-nav-scrim absolute inset-0 bg-canvas/75 backdrop-blur-sm"
          />
          <aside className="mobile-nav-panel absolute inset-y-0 left-0 w-[248px] border-r border-hairline bg-canvas shadow-float">
            <button
              ref={mobileCloseRef}
              data-mobile-nav-close
              type="button"
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
              className="absolute right-2 top-3 z-10 grid h-8 w-8 place-items-center rounded-sm text-ink-tertiary hover:bg-raised hover:text-ink"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
            {renderRail(true, () => setMobileOpen(false))}
          </aside>
        </div>
      ) : null}

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} preview={preview} />
    </div>
  );
}
