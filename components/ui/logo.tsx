import Link from "next/link";

import { APP_NAME } from "@/lib/config";
import { cn } from "@/lib/utils";

/**
 * The mark is a patched quilt square: three patches sewn down, the fourth
 * left loose and offset. It prints in one ink with the accent as the loose
 * patch, so it works on the obsidian ground at any size.
 */
function PatchMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("h-[22px] w-[22px]", className)}
      fill="none"
    >
      <rect x="1.6" y="1.6" width="9.4" height="9.4" fill="currentColor" />
      <rect x="12.9" y="1.6" width="9.4" height="9.4" fill="currentColor" opacity="0.45" />
      <rect x="1.6" y="12.9" width="9.4" height="9.4" fill="currentColor" opacity="0.45" />
      <rect x="14.2" y="14.2" width="8.1" height="8.1" fill="var(--accent)" />
      <path
        d="M1.6 12.1h20.7M12.1 1.6v20.7"
        stroke="var(--canvas)"
        strokeWidth="1.4"
        strokeDasharray="1.8 2.2"
      />
    </svg>
  );
}

export function Logo({
  className,
  href = "/",
  markOnly = false,
  tone: _tone,
}: {
  className?: string;
  href?: string;
  markOnly?: boolean;
  /** Kept for call-site compatibility; the product has one dark surface now. */
  tone?: "paper" | "night";
}) {
  const content = (
    <>
      <span className="shrink-0 text-ink">
        <PatchMark />
      </span>
      {!markOnly ? (
        <span className="display text-[16px] tracking-[-0.02em] text-ink">{APP_NAME}</span>
      ) : null}
    </>
  );

  if (!href) {
    return <div className={cn("flex items-center gap-2.5", className)}>{content}</div>;
  }

  return (
    <Link
      href={href}
      className={cn("flex items-center gap-2.5", className)}
      aria-label={`${APP_NAME} home`}
    >
      {content}
    </Link>
  );
}
