import Link from "next/link";

import { BackLink } from "@/components/patchwork/back-link";
import { APP_NAME } from "@/lib/config";
import { cn } from "@/lib/utils";

import { Logo } from "@/components/ui/logo";

/**
 * The public frame. Both public surfaces (the tracker and the status board)
 * share it so the brand reads the same the moment a customer arrives: a way
 * back on the left, the mark beside it, one quiet exit on the right.
 */
export function SiteHeader({
  action,
  back,
  className,
}: {
  /** The single right-hand control for this page. */
  action?: { href: string; label: string };
  /** The way out. Falls back to history when the caller has no route to offer. */
  back?: { href: string; label: string };
  className?: string;
}) {
  return (
    <header className={cn("flex items-center justify-between gap-4", className)}>
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

      <div className="flex items-center gap-5">
        <Link
          href="/status"
          className="hidden font-sans text-[13px] text-ink-tertiary transition-colors hover:text-ink sm:block"
        >
          System status
        </Link>
        {action ? (
          <Link
            href={action.href}
            className="inline-flex h-9 items-center rounded-sm border border-hairline-strong bg-raised px-3.5 font-sans text-[13px] font-medium text-ink transition-colors duration-150 hover:border-ink-faint hover:bg-overlay"
          >
            {action.label}
          </Link>
        ) : null}
      </div>
    </header>
  );
}

export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("border-t border-hairline pt-5", className)}>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1.5">
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
