"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect } from "react";

const SIZE = 760;

/**
 * A single light source dragged across the canvas. Position is spring-followed
 * so the glow trails the pointer instead of snapping to it.
 */
export function CursorSpotlight() {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 55, damping: 22, mass: 0.7 });
  const sy = useSpring(y, { stiffness: 55, damping: 22, mass: 0.7 });
  const translateX = useTransform(sx, (value) => value - SIZE / 2);
  const translateY = useTransform(sy, (value) => value - SIZE / 2);

  useEffect(() => {
    if (reduced) return;

    const move = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
    };

    x.set(window.innerWidth / 2);
    y.set(window.innerHeight * 0.34);
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [reduced, x, y]);

  if (reduced) {
    return (
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-1/3 h-[760px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(closest-side, rgba(99,102,241,0.14), rgba(34,211,238,0.05) 52%, transparent 76%)",
          }}
        />
      </div>
    );
  }

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <motion.div
        className="absolute left-0 top-0 rounded-full will-change-transform"
        style={{
          width: SIZE,
          height: SIZE,
          x: translateX,
          y: translateY,
          background:
            "radial-gradient(closest-side, rgba(99,102,241,0.20), rgba(34,211,238,0.07) 52%, transparent 76%)",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.045),transparent_58%)]" />
    </div>
  );
}
