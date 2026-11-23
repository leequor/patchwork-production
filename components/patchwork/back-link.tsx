"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The way back out of a page.
 *
 * Two behaviours in one control, because a page does not always know where it
 * was reached from: if this tab has a previous entry in its own history, go
 * back there (which is what a person means by "back"); otherwise take the
 * caller's fallback route so a direct visit never dead-ends.
 *
 * Rendered as a real button rather than a link, because there is no href to
 * promise to a screen reader or a middle click.
 */
export function BackLink({
  label = "Back",
  fallbackHref = "/",
  className,
}: {
  label?: string;
  fallbackHref?: string;
  className?: string;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        const cameFromThisSite =
          typeof window !== "undefined" &&
          window.history.length > 1 &&
          document.referrer.startsWith(window.location.origin);

        if (cameFromThisSite) router.back();
        else router.push(fallbackHref);
      }}
      className={cn(
        "group inline-flex items-center gap-1 rounded-sm pl-1 pr-2 py-1 font-sans text-[13px] text-ink-tertiary",
        "transition-colors duration-150 hover:text-ink focus-visible:text-ink",
        className,
      )}
    >
      <ChevronLeft
        aria-hidden="true"
        strokeWidth={2.2}
        className="h-4 w-4 transition-transform duration-150 group-hover:-translate-x-0.5"
      />
      {label}
    </button>
  );
}
