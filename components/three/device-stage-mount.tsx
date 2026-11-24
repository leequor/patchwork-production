"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import type { TicketStatus } from "@/lib/repair/types";
import type { DeviceForm } from "@/lib/device-form";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

const DeviceStage = dynamic(() => import("./device-stage"), {
  ssr: false,
  loading: () => null,
});

/**
 * The stage holder. Three.js is ~150 kB gzipped, so it is only fetched once the
 * stage is actually near the viewport, never on first paint. A quiet bench
 * surface stands in until then — no placeholder drawing of a phone.
 *
 * With reduced motion the scene still renders (it is the progress indicator, not
 * decoration): it just stops drifting and stops answering the pointer.
 */
export function DeviceStageMount({
  status,
  form = "handheld",
  className,
  quality = "high",
  caption,
}: {
  status: TicketStatus;
  /** Which device the bench is holding. Defaults to a handset. */
  form?: DeviceForm;
  className?: string;
  quality?: "high" | "low";
  caption?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    if (typeof IntersectionObserver === "undefined") {
      const timer = window.setTimeout(() => setReady(true), 0);
      return () => window.clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );

    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={cn("relative isolate overflow-hidden", className)}>
      {/* The bench surface, masked at the edges so the panel has no rectangle:
          the light and the device dissolve into the room around them. */}
      <div className="bench-fade relative h-full w-full">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(58% 48% at 52% 42%, rgba(110,92,247,0.2) 0%, rgba(110,92,247,0.06) 46%, rgba(9,8,15,0) 74%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(78% 68% at 50% 108%, rgba(6,4,14,0.55) 0%, rgba(6,4,14,0) 62%)",
          }}
        />

        <div ref={hostRef} className="relative h-full w-full">
          {ready ? (
            <DeviceStage
              status={status}
              form={form}
              quality={reduced ? "low" : quality}
              label={caption ?? "Bench view of the device in this repair"}
            />
          ) : null}
        </div>
      </div>

      {caption ? (
        <p className="pointer-events-none absolute inset-x-0 bottom-0 z-10 pb-0.5 text-center font-mono text-2xs uppercase tracking-[0.18em] text-ink-tertiary">
          {caption}
        </p>
      ) : null}
    </div>
  );
}
