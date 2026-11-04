import Link from "next/link";

import { APP_NAME } from "@/lib/config";
import { cn } from "@/lib/utils";

/**
 * The mark is a work-order stub: a torn ticket with a perforation and a punch
 * notch, the one object every repair shop actually handles all day.
 */
function TicketMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("h-[18px] w-[18px]", className)}
      fill="none"
    >
      <path
        d="M2.6 5.4h11.1v4.1a2.3 2.3 0 0 0 0 5v4.1H2.6a1 1 0 0 1-1-1v-4a2.3 2.3 0 0 0 0-4.3v-3.9a1 1 0 0 1 1-1Z"
        fill="currentColor"
      />
      <path d="M16.4 5.4h4a1 1 0 0 1 1 1v3.9a2.3 2.3 0 0 0 0 4.3v4a1 1 0 0 1-1 1h-4" fill="currentColor" opacity="0.42" />
      <path d="M16.4 4.6v14.8" stroke="#0D1413" strokeWidth="1.5" strokeDasharray="1.6 1.9" />
      <circle cx="6.4" cy="12" r="1.5" fill="#0D1413" opacity="0.55" />
      <path d="M9.4 9.4h4.2M9.4 12h3M9.4 14.6h4.2" stroke="#0D1413" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
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
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-sm bg-accent text-[#0D1413]">
        <TicketMark />
      </span>
      {!markOnly ? (
        <span className="text-[15px] font-semibold tracking-[-0.01em] text-ink">{APP_NAME}</span>
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
