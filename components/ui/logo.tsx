import Link from "next/link";

import { APP_NAME } from "@/lib/config";
import { cn } from "@/lib/utils";

/** A bold P with a sewn-in lavender panel. */
export function PatchMark({ className }: { className?: string }) {
  const markShape =
    "M4 21.5V3.4A1.4 1.4 0 0 1 5.4 2h7.4c5.5 0 8.6 2.9 8.6 7.6s-3.1 7.6-8.6 7.6H9v4.3z M9 6.5v6.4h3.8c2.5 0 3.8-.9 3.8-3.2s-1.3-3.2-3.8-3.2z";

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("h-[22px] w-[22px]", className)}
      fill="none"
    >
      <defs>
        <clipPath id="patchwork-p">
          <path d={markShape} clipRule="evenodd" />
        </clipPath>
        <linearGradient id="patchwork-p-body" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8E7EFF" />
          <stop offset="1" stopColor="#6E5CF7" />
        </linearGradient>
        <linearGradient id="patchwork-patch" x1="12" y1="2" x2="20" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D3C9FF" />
          <stop offset="1" stopColor="#9B87FF" />
        </linearGradient>
      </defs>

      <path d={markShape} fill="url(#patchwork-p-body)" fillRule="evenodd" />

      <g clipPath="url(#patchwork-p)">
        <path
          d="M12.1 2h.7c5.5 0 8.6 2.9 8.6 7.6 0 1.8-.4 3.3-1.1 4.5L15 10.4l-2.9-3.6V2Z"
          fill="url(#patchwork-patch)"
        />
        <path d="m13.7 3.6 4.8 7.4" stroke="#35277F" strokeWidth="1.3" />
        <g fill="#F4F0FF">
          <rect x="14.4" y="5.3" width="2.7" height="1.05" rx="0.52" transform="rotate(-33 15.75 5.825)" />
          <rect x="16" y="7.9" width="2.7" height="1.05" rx="0.52" transform="rotate(-33 17.35 8.425)" />
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
        <span className="display text-[16px] tracking-[-0.03em] text-ink">
          <span>Patch</span>
          <span className="text-accent-bright">work</span>
        </span>
      ) : null}
    </>
  );

  if (!href) {
    return <div className={cn("tap flex items-center gap-2.5", className)}>{content}</div>;
  }

  return (
    <Link
      href={href}
      className={cn("tap flex items-center gap-2.5", className)}
      aria-label={`${APP_NAME} home`}
    >
      {content}
    </Link>
  );
}
