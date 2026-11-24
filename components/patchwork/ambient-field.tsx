"use client";

import { useEffect, useRef } from "react";

import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/**
 * The room the product sits in.
 *
 * Three soft light fields behind everything: a violet lamp high and left, a cool
 * cyan spill low and right, and a deep indigo floor that carries the vignette.
 * They follow the pointer with heavy damping and, left alone, drift on their own
 * orbits — so the page breathes without ever looking like a mouse trail.
 *
 * Engineering notes, because a full-screen moving gradient is easy to do badly:
 *
 *  - Each orb is a pre-softened `radial-gradient` on its own composited layer.
 *    No `filter: blur()`, no animated `background-position`: moving these is
 *    `transform` only, so the compositor does the work and paint never runs.
 *  - Values are written straight to the DOM from a single rAF loop. React does
 *    not re-render on pointer movement.
 *  - Damping is `1 - exp(-k·dt)`, so the motion is frame-rate independent: it
 *    looks the same at 60 Hz and 144 Hz.
 *  - The loop stops when the tab is hidden and never starts under
 *    `prefers-reduced-motion` — the fields are still there, just still.
 *  - Pointer influence is halved on coarse pointers (touch), where there is no
 *    hover to follow and the drift alone is the whole effect.
 */

type Orb = {
  /** Centre of the orbit, as a fraction of the viewport. */
  x: number;
  y: number;
  /** Diameter, in `vmax`. */
  size: number;
  color: string;
  /** Peak opacity of the field's centre. */
  alpha: number;
  /** How far the orb drifts on its own, in px. */
  drift: number;
  /** Seconds for one full orbit. */
  period: number;
  /** Where in that orbit it starts. */
  phase: number;
  /** Pointer travel in px. Larger reads as closer to the viewer. */
  depth: number;
  /** Damping rate — lower is heavier. */
  ease: number;
  /** A near light that answers the pointer directly, rather than drifting. */
  tracks?: boolean;
};

const ORBS: Orb[] = [
  {
    x: 0.24,
    y: 0.16,
    size: 74,
    color: "110, 92, 247",
    alpha: 0.34,
    drift: 46,
    period: 27,
    phase: 0,
    depth: 190,
    ease: 1.5,
  },
  {
    x: 0.8,
    y: 0.6,
    size: 58,
    color: "69, 211, 232",
    alpha: 0.3,
    drift: 58,
    period: 41,
    phase: 2.1,
    depth: 260,
    ease: 1.1,
  },
  {
    x: 0.5,
    y: 0.96,
    size: 86,
    color: "78, 61, 224",
    alpha: 0.3,
    drift: 30,
    period: 33,
    phase: 4.4,
    depth: 90,
    ease: 2.1,
  },
  {
    /* The near light: it answers the pointer almost immediately, the way a lamp
       in front of the screen would. Kept dim and large so it reads as light
       falling on a wall, not as a cursor effect. */
    x: 0.5,
    y: 0.5,
    size: 56,
    color: "156, 139, 255",
    alpha: 0.26,
    drift: 0,
    period: 1,
    phase: 0,
    depth: 0,
    ease: 5.5,
    tracks: true,
  },
];

export function AmbientField() {
  const hostRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const layers = Array.from(host.querySelectorAll<HTMLElement>("[data-orb]"));
    if (layers.length === 0) return;

    const place = (index: number, offsetX: number, offsetY: number) => {
      const layer = layers[index];
      if (!layer) return;
      layer.style.transform = `translate3d(-50%, -50%, 0) translate3d(${offsetX.toFixed(
        2,
      )}px, ${offsetY.toFixed(2)}px, 0)`;
    };

    /* Still is a valid state: the fields are already positioned by CSS. */
    if (reduced) {
      ORBS.forEach((_, index) => place(index, 0, 0));
      return;
    }

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const pull = coarse ? 0.45 : 1;

    /* -1..1, centred. Start neutral so nothing snaps on first paint. */
    const pointer = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    const current = ORBS.map(() => ({ x: 0, y: 0 }));

    const onPointer = (event: PointerEvent) => {
      target.x = (event.clientX / window.innerWidth - 0.5) * 2;
      target.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const onLeave = () => {
      target.x = 0;
      target.y = 0;
    };

    let frame = 0;
    let previous = performance.now();
    const started = previous;

    const step = (now: number) => {
      const dt = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      const elapsed = (now - started) / 1000;

      /* The pointer is damped too, so a fast flick never whips the light. */
      const pointerEase = 1 - Math.exp(-2.4 * dt);
      pointer.x += (target.x - pointer.x) * pointerEase;
      pointer.y += (target.y - pointer.y) * pointerEase;

      ORBS.forEach((orb, index) => {
        const state = current[index];
        const spin = (elapsed / orb.period) * Math.PI * 2 + orb.phase;

        const wantX = orb.tracks
          ? pointer.x * window.innerWidth * 0.42
          : pointer.x * orb.depth * pull + Math.cos(spin) * orb.drift;
        const wantY = orb.tracks
          ? pointer.y * window.innerHeight * 0.42
          : pointer.y * orb.depth * pull + Math.sin(spin * 0.8) * orb.drift * 0.7;

        const ease = 1 - Math.exp(-orb.ease * dt);
        state.x += (wantX - state.x) * ease;
        state.y += (wantY - state.y) * ease;

        place(index, state.x, state.y);
      });

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

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    if (!coarse) window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);

    start();

    return () => {
      stop();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {ORBS.map((orb) => (
        <div
          key={orb.color + orb.x}
          data-orb=""
          className="absolute rounded-full will-change-transform"
          style={{
            left: `${orb.x * 100}%`,
            top: `${orb.y * 100}%`,
            width: `min(${orb.size}vmax, 860px)`,
            height: `min(${orb.size}vmax, 860px)`,
            transform: "translate3d(-50%, -50%, 0)",
            background: `radial-gradient(closest-side, rgba(${orb.color}, ${orb.alpha}), rgba(${orb.color}, ${orb.alpha * 0.55}) 32%, rgba(${orb.color}, ${orb.alpha * 0.16}) 58%, rgba(${orb.color}, 0) 76%)`,
          }}
        />
      ))}

      {/* The walls: a vignette over the light, so the corners stay corners. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(130% 95% at 50% 118%, rgba(0, 0, 0, 0.66), transparent 68%)",
        }}
      />

      {/* Grain last, so the gradient steps never band on an OLED or a phone. */}
      <div className="grain absolute inset-0" />
    </div>
  );
}
