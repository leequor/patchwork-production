import Link from "next/link";

import { APP_NAME } from "@/lib/config";
import { cn } from "@/lib/utils";

/**
 * The mark is a patched quilt square: three patches sewn down, the fourth
 * left loose and offset, with stitch marks across the seams. It is the name
 * made as a drawing, and it prints in one ink.
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
      <rect x="12.9" y="1.6" width="9.4" height="9.4" fill="currentColor" opacity="0.55" />
      <rect x="1.6" y="12.9" width="9.4" height="9.4" fill="currentColor" opacity="0.55" />
      <rect x="14.2" y="14.2" width="8.1" height="8.1" fill="#CE3F1B" />
      <path
        d="M1.6 12.1h20.7M12.1 1.6v20.7"
        stroke="var(--mark-stitch, #0B171C)"
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
  tone = "paper",
}: {
  className?: string;
  href?: string;
  markOnly?: boolean;
  tone?: "paper" | "night";
}) {
  const content = (
    <>
      <span
        className={cn(
          "shrink-0",
          tone === "night" ? "text-cream [--mark-stitch:#12242A]" : "text-ink [--mark-stitch:#E9E6DE]",
        )}
      >
        <PatchMark />
      </span>
      {!markOnly ? (
        <span
          className={cn(
            "display text-[17px] tracking-[-0.02em]",
            tone === "night" ? "text-cream" : "text-ink",
          )}
        >
          {APP_NAME}
        </span>
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
