"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RotateCw, TriangleAlert } from "lucide-react";

/**
 * The page that catches everything else.
 *
 * Without this, any uncaught render error hands the visitor Next's grey
 * "Application error" with a stack trace — the single most unprofessional screen
 * a shop can show. This says what happened, what did not happen, and offers two
 * ways forward: try again, or go somewhere that still works.
 *
 * It stays inside the root layout, so the fonts, palette and ambient field are
 * all still there: the room does not disappear because one panel failed.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Keep the failure in the server log even though the UI is friendly.
    console.error("[error boundary]", error);
  }, [error]);

  return (
    <main className="relative mx-auto flex min-h-[100dvh] w-full max-w-[720px] flex-col justify-center px-5 py-16 sm:px-8">
      <div className="rounded-lg bg-panel p-6 ring-1 ring-inset ring-white/[0.07] sm:p-8">
        <p className="eyebrow text-negative">
          <span>Something broke</span>
        </p>

        <h1 className="display-hero mt-5 text-[clamp(32px,4.4vw,48px)] text-ink">
          This page hit a snag.
        </h1>

        <p className="mt-4 max-w-[52ch] font-sans text-[16px] leading-[1.6] text-ink-secondary">
          Nothing you entered was lost, and no repair record was changed. Try the page again — if it
          keeps failing, the desk screen still works and the bench can carry on.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
          <button
            type="button"
            onClick={reset}
            className="primary press inline-flex h-10 items-center gap-2 rounded-full px-4 font-sans text-[14px] font-semibold text-[#0b0916]"
          >
            <RotateCw className="h-4 w-4" strokeWidth={2.1} aria-hidden="true" />
            Try again
          </button>

          <Link
            href="/track"
            className="font-sans text-[14px] font-medium text-ink transition-colors hover:text-accent-bright"
          >
            Track a repair
          </Link>
          <Link
            href="/status"
            className="font-sans text-[14px] text-ink-tertiary transition-colors hover:text-ink"
          >
            System status
          </Link>
        </div>

        {error.digest ? (
          <p className="mt-8 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
            <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
            Reference {error.digest}
          </p>
        ) : null}
      </div>
    </main>
  );
}
