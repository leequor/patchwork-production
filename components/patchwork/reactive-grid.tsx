"use client";

import { useEffect, useRef } from "react";

import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/**
 * The blueprint grid, with a torch on it.
 *
 * Two identical grids stacked: a dim one that is always there, and a brighter
 * one revealed through a soft radial mask that follows the pointer. The bright
 * layer also shifts two pixels against the pointer, so the grid reads as a
 * surface at depth rather than a flat printed pattern.
 *
 * Why this and not a spotlight: every dark landing page has a spotlight. A grid
 * that brightens under the hand is the same gesture told in the page's own
 * language — the drawing, not a torch on it.
 *
 * Cheap by construction: no canvas, no per-frame layout. One CSS variable pair
 * is written per frame and consumed by a mask, so the work stays on the
 * compositor. `prefers-reduced-motion`: the grid simply stays dim.
 */
export function ReactiveGrid({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const host = hostRef.current;
    if (!host || reduced) return;

    const pointer = { x: 0.5, y: 0.5 };
    const eased = { x: 0.5, y: 0.5 };
    let frame = 0;
    let previous = performance.now();

    const onPointer = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointer.x = (event.clientX - rect.left) / rect.width;
      pointer.y = (event.clientY - rect.top) / rect.height;
    };

    const step = (now: number) => {
      const dt = Math.min((now - previous) / 1000, 0.05);
      previous = now;

      const ease = 1 - Math.exp(-4.5 * dt);
      eased.x += (pointer.x - eased.x) * ease;
      eased.y += (pointer.y - eased.y) * ease;

      host.style.setProperty("--gx", `${(eased.x * 100).toFixed(2)}%`);
      host.style.setProperty("--gy", `${(eased.y * 100).toFixed(2)}%`);
      host.style.setProperty("--gdx", `${((eased.x - 0.5) * -14).toFixed(2)}px`);
      host.style.setProperty("--gdy", `${((eased.y - 0.5) * -14).toFixed(2)}px`);

      frame = requestAnimationFrame(step);
    };

    const start = () => {
      if (frame) return;
      previous = performance.now();
      frame = requestAnimationFrame(step);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      stop();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  const lines = (alpha: number) =>
    `linear-gradient(to right, rgba(241,239,250,${alpha}) 1px, transparent 1px), linear-gradient(to bottom, rgba(241,239,250,${alpha}) 1px, transparent 1px)`;

  return (
    <div ref={hostRef} aria-hidden="true" className={className}>
      {/* The drawing, at rest. */}
      <div
        className="absolute inset-0"
        style={{ backgroundImage: lines(0.04), backgroundSize: "132px 132px" }}
      />

      {/* The same drawing, lit where the hand is, and shifted a few pixels
          against it so the surface has depth. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: lines(0.17),
          backgroundSize: "132px 132px",
          transform: "translate3d(var(--gdx, 0px), var(--gdy, 0px), 0)",
          WebkitMaskImage:
            "radial-gradient(420px 340px at var(--gx, 50%) var(--gy, 46%), #000 0%, rgba(0,0,0,0.6) 42%, transparent 78%)",
          maskImage:
            "radial-gradient(420px 340px at var(--gx, 50%) var(--gy, 46%), #000 0%, rgba(0,0,0,0.6) 42%, transparent 78%)",
        }}
      />
    </div>
  );
}
