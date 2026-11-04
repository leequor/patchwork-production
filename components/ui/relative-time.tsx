import { formatRelative } from "@/lib/repair/format";

/**
 * Relative labels drift between the server render and hydration ("this minute"
 * becomes "1 minute ago"), which React reports as a hydration mismatch. The
 * text is exempt from that comparison, while the <time> element keeps a
 * machine-readable timestamp for assistive tech.
 */
export function RelativeTime({
  value,
  className,
}: {
  value: string | null | undefined;
  className?: string;
}) {
  return (
    <time dateTime={value ?? undefined} suppressHydrationWarning className={className}>
      {formatRelative(value)}
    </time>
  );
}
