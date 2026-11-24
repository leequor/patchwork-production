import Link from "next/link";

import { APP_NAME } from "@/lib/config";
import { cn } from "@/lib/utils";

/**
 * The mark: two pieces of cloth, sewn into one square.
 *
 * A repair shop called Patchwork. The previous mark was a device with its corner
 * stuck back on, and at 16px the corner and the stitches both disappeared.
 *
 * This is the idea with nothing left to lose: one square, made of two pieces of
 * equal size, a seam between them, and thread pulled along the seam. Four
 * decisions, all of them load-bearing at small sizes:
 *
 * 1. **Equal pieces.** A symmetric split is the one arrangement that survives
 *    rasterisation — an asymmetric corner patch reads as a folded page.
 * 2. **A real value gap.** Bright lavender against deep indigo, not two tints of
 *    the same colour. At 16px the split has to survive as two tones.
 * 3. **The seam is a stroke**, in the page's ground colour, so the two pieces
 *    read as cloth laid edge to edge rather than one shape with a line on it.
 * 4. **Thread on the dark half only.** Pale dashes on deep indigo still read at
 *    16px; pale dashes on pale lavender vanish. This is the detail that says
 *    "sewn", and it is placed where it can be seen.
 *
 * Drawn on a 24 grid; square (2.5 → 21.5), radius 5, seam on the true diagonal.
 */
export function PatchMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("h-[22px] w-[22px]", className)}
      fill="none"
    >
      <defs>
        <clipPath id="patchwork-block">
          <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
        </clipPath>
        <linearGradient
          id="patchwork-lit"
          x1="3"
          y1="3"
          x2="15"
          y2="17"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#C2B4FF" />
          <stop offset="1" stopColor="#8C79FF" />
        </linearGradient>
        <linearGradient
          id="patchwork-deep"
          x1="21"
          y1="21"
          x2="10"
          y2="8"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#241A66" />
          <stop offset="1" stopColor="#4B3AD0" />
        </linearGradient>
      </defs>

      <g clipPath="url(#patchwork-block)">
        <rect x="2.5" y="2.5" width="19" height="19" fill="url(#patchwork-deep)" />
        <path d="M2.5 2.5H21.5L2.5 21.5Z" fill="url(#patchwork-lit)" />

        <path d="M0.4 23.6 23.6 0.4" stroke="var(--canvas)" strokeWidth="1.6" />

        {/* Thread, running along the far side of the seam. */}
        <g fill="#F4F0FF">
          <rect x="5.7" y="13.9" width="3.5" height="1.1" rx="0.55" transform="rotate(-45 7.45 14.45)" />
          <rect x="8.9" y="10.7" width="3.5" height="1.1" rx="0.55" transform="rotate(-45 10.65 11.25)" />
          <rect x="12.1" y="7.5" width="3.5" height="1.1" rx="0.55" transform="rotate(-45 13.85 8.05)" />
          <rect x="15.3" y="4.3" width="3.5" height="1.1" rx="0.55" transform="rotate(-45 17.05 4.85)" />
        </g>
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
