import Link from "next/link";

import { APP_NAME } from "@/lib/config";
import { cn } from "@/lib/utils";

/**
 * The mark: a rounded square with its corner patched back on.
 *
 * A repair shop named Patchwork. The shape is one confident silhouette — a
 * device, a card, a panel — whose top-right quarter is a separate piece sewn
 * down slightly askew. That is the whole idea: the thing is whole again, and
 * you can still see where it was mended.
 *
 * Drawn on a 24 grid. The seam runs (11,3) → (21,13); the patch is rotated −3°
 * about the seam's inner end so the outer edge lifts by half a pixel, and the
 * two stitch bars cross the gap. At 16 px the silhouette still reads; the
 * stitches come back at 24 px and up.
 */
export function PatchMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("h-[22px] w-[22px]", className)}
      fill="none"
    >
      <rect x="3" y="3" width="18" height="18" rx="5.2" fill="currentColor" />

      <g transform="rotate(-3 11 3)">
        {/* The gap is the stroke: ground-coloured, so the patch reads as a piece
            laid on top rather than a fill split down the middle. */}
        <path
          d="M11 3H18.2a2.8 2.8 0 0 1 2.8 2.8V13Z"
          stroke="var(--canvas)"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M11 3H18.2a2.8 2.8 0 0 1 2.8 2.8V13Z" fill="var(--accent-bright)" />
      </g>

      {/* Two stitches, pulled across the seam. */}
      <g fill="currentColor">
        <rect x="13.15" y="5.9" width="3" height="1.8" rx="0.9" transform="rotate(40 14.65 6.8)" />
        <rect x="16.05" y="8.8" width="3" height="1.8" rx="0.9" transform="rotate(40 17.55 9.7)" />
      </g>
    </svg>
  );
}

export function Logo({
  className,
  href = "/",
  markOnly = false,
}: {
  className?: string;
  href?: string;
  markOnly?: boolean;
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
