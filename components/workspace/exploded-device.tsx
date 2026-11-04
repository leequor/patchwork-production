"use client";

import {
  animate,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect } from "react";

import type { TicketStatus } from "@/lib/repair/types";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

const DEPTH = [-1.5, -1, -0.5, 0.5, 1, 1.5];
/** Forty either side of the frame: an 80px tear-down, not a fanned deck. */
const Z = [-40, -24, -8, 8, 24, 40];
const Y = [-10, -6, -2, 2, 6, 10];

/**
 * How the bench reads a job. Intake sits closed; diagnosing lifts only the
 * screen; a repair in progress is fully open; ready closes it under a green
 * light; a collected device drops back to a wireframe.
 */
const SHAPES: Record<
  TicketStatus,
  {
    explode: number;
    screen: number;
    glow: number;
    ring: "indigo" | "emerald" | "none";
    scan?: boolean;
    wireframe?: boolean;
  }
> = {
  intake: { explode: 0, screen: 0, glow: 0.25, ring: "indigo" },
  diagnosing: { explode: 0, screen: 1, glow: 0.55, ring: "indigo", scan: true },
  waiting_parts: { explode: 0.42, screen: 0, glow: 0.45, ring: "indigo" },
  in_repair: { explode: 1, screen: 0, glow: 1, ring: "indigo" },
  ready: { explode: 0, screen: 0, glow: 1, ring: "emerald" },
  picked_up: { explode: 0, screen: 0, glow: 0, ring: "none", wireframe: true },
  cancelled: { explode: 0, screen: 0, glow: 0.15, ring: "none" },
};

function layerTransform(
  index: number,
  x: number,
  y: number,
  explode: number,
  screen: number,
) {
  const depth = DEPTH[index];
  const isScreen = index >= 4;
  const shiftX = x * depth * 12;
  const baseY = Y[index] * explode;
  const baseZ = Z[index] * explode + (isScreen ? 25 * screen : 0);
  const shiftY = baseY + y * depth * 7 * (explode > 0 || screen > 0 ? 1 : 0.4);
  const tilt = isScreen ? -15 * screen : 0;
  return `translate(-50%, -50%) translate3d(${shiftX.toFixed(2)}px, ${shiftY.toFixed(
    2,
  )}px, ${baseZ.toFixed(2)}px) rotateX(${tilt.toFixed(2)}deg)`;
}

/**
 * A phone taken apart in the air. Every layer is drawn in CSS — no asset to
 * ship — and the stack answers the pointer through two springs: the whole
 * assembly turns, and each layer slides by its own depth for parallax.
 */
export function ExplodedDevice({
  className,
  status,
  pointerX,
  pointerY,
}: {
  className?: string;
  status: TicketStatus;
  pointerX?: MotionValue<number>;
  pointerY?: MotionValue<number>;
}) {
  const reduced = usePrefersReducedMotion();
  const shape = SHAPES[status];
  const explodeTarget = shape.explode;
  const screenTarget = shape.screen;

  const restX = useMotionValue(0);
  const restY = useMotionValue(0);
  const px = useSpring(pointerX ?? restX, { stiffness: 120, damping: 24, mass: 0.7 });
  const py = useSpring(pointerY ?? restY, { stiffness: 120, damping: 24, mass: 0.7 });

  const explode = useMotionValue(explodeTarget);
  const screen = useMotionValue(screenTarget);

  useEffect(() => {
    const spring = { type: "spring", stiffness: 120, damping: 26, mass: 0.9 } as const;
    const explodeControls = animate(explode, explodeTarget, spring);
    const screenControls = animate(screen, screenTarget, spring);
    return () => {
      explodeControls.stop();
      screenControls.stop();
    };
  }, [explode, screen, explodeTarget, screenTarget]);

  const rotateX = useTransform(py, (value) => 14 - value * 8);
  const rotateY = useTransform(px, (value) => -20 + value * 10);

  const l0 = useTransform([px, py, explode, screen], (latest) => {
    const [x, y, e, s] = latest as number[];
    return layerTransform(0, x, y, e, s);
  });
  const l1 = useTransform([px, py, explode, screen], (latest) => {
    const [x, y, e, s] = latest as number[];
    return layerTransform(1, x, y, e, s);
  });
  const l2 = useTransform([px, py, explode, screen], (latest) => {
    const [x, y, e, s] = latest as number[];
    return layerTransform(2, x, y, e, s);
  });
  const l3 = useTransform([px, py, explode, screen], (latest) => {
    const [x, y, e, s] = latest as number[];
    return layerTransform(3, x, y, e, s);
  });
  const l4 = useTransform([px, py, explode, screen], (latest) => {
    const [x, y, e, s] = latest as number[];
    return layerTransform(4, x, y, e, s);
  });
  const l5 = useTransform([px, py, explode, screen], (latest) => {
    const [x, y, e, s] = latest as number[];
    return layerTransform(5, x, y, e, s);
  });

  const transforms = [l0, l1, l2, l3, l4, l5];

  const layers = [
    {
      key: "back",
      body: (
        <div className="relative h-full w-full rounded-[26px] border border-white/10 bg-gradient-to-br from-[#1c1c22] via-[#141418] to-[#0b0b0e]">
          <div className="absolute left-3 top-3 h-[58px] w-[58px] rounded-2xl border border-white/10 bg-black/50 p-2">
            <div className="grid h-full w-full grid-cols-2 gap-1.5">
              <span className="rounded-full bg-[#0d0d11] ring-1 ring-white/15" />
              <span className="rounded-full bg-[#0d0d11] ring-1 ring-white/15" />
              <span className="rounded-full bg-[#0d0d11] ring-1 ring-white/15" />
              <span className="rounded-full bg-[#151519] ring-1 ring-white/5" />
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "battery",
      body: (
        <div className="flex h-full w-full flex-col gap-2 rounded-[26px] border border-white/10 bg-[#101014] p-3">
          {[0, 1, 2].map((cell) => (
            <div
              key={cell}
              className="flex-1 rounded-lg border border-white/[0.07] bg-gradient-to-b from-white/[0.05] to-transparent"
            />
          ))}
          <span className="font-mono text-[8px] tracking-[0.08em] text-ink-faint">
            Li-ion · 4.2V
          </span>
        </div>
      ),
    },
    {
      key: "board",
      body: (
        <div className="relative h-full w-full overflow-hidden rounded-[26px] border border-white/10 bg-[#0a0f12]">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, transparent 0 9px, rgba(251,191,36,0.16) 9px 10px), repeating-linear-gradient(0deg, transparent 0 13px, rgba(34,211,238,0.10) 13px 14px)",
            }}
          />
          <div className="absolute left-3 top-4 h-16 w-14 rounded-md border border-white/10 bg-[#12161a]" />
          <div className="absolute right-3 top-4 h-10 w-10 rounded-md border border-white/10 bg-[#151a1e]" />
          <div className="absolute left-4 top-24 h-8 w-20 rounded-sm border border-white/10 bg-[#12161a]" />
          <div className="absolute right-4 top-28 h-6 w-12 rounded-sm border border-white/10 bg-[#12161a]" />
          {shape.scan ? (
            <div
              aria-hidden="true"
              className="animate-scan pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-transparent via-accent-cyan/30 to-transparent"
            />
          ) : null}
        </div>
      ),
    },
    {
      key: "frame",
      body: (
        <div className="relative h-full w-full rounded-[26px] border-2 border-white/15 bg-white/[0.02]">
          <div className="absolute inset-x-3 top-2 flex justify-center gap-1">
            {Array.from({ length: 9 }).map((_, dot) => (
              <span key={dot} className="h-1 w-1 rounded-full bg-white/20" />
            ))}
          </div>
          <div className="absolute inset-x-4 top-6 h-[2px] rounded-full bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          <div className="absolute inset-x-4 bottom-6 h-[2px] rounded-full bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        </div>
      ),
    },
    {
      key: "display",
      body: (
        <div className="relative h-full w-full overflow-hidden rounded-[26px] border border-white/10 bg-[#06070b] p-2">
          <div className="relative h-full w-full overflow-hidden rounded-[20px] bg-[radial-gradient(120%_80%_at_50%_0%,rgba(99,102,241,0.34),transparent_60%),radial-gradient(90%_60%_at_50%_100%,rgba(34,211,238,0.20),transparent_60%)]">
            <div className="absolute left-1/2 top-2 h-3 w-12 -translate-x-1/2 rounded-full bg-black/80" />
            <div className="absolute inset-x-6 top-9 h-[2px] rounded-full bg-white/20" />
            <div className="absolute inset-x-10 top-12 h-[2px] rounded-full bg-white/10" />
          </div>
        </div>
      ),
    },
    {
      key: "glass",
      body: (
        <div className="relative h-full w-full rounded-[26px] border border-white/25 bg-gradient-to-br from-white/[0.10] via-white/[0.02] to-white/[0.06]">
          <div className="absolute inset-x-6 top-4 h-16 rounded-2xl bg-gradient-to-b from-white/15 to-transparent" />
        </div>
      ),
    },
  ];

  return (
    <div aria-hidden="true" className={cn("relative flex items-center justify-center", className)}>
      <div
        aria-hidden="true"
        className="glow-accent pointer-events-none absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500"
        style={{ opacity: shape.ring === "indigo" ? shape.glow : 0 }}
      />
      <div
        aria-hidden="true"
        className="glow-ready pointer-events-none absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500"
        style={{ opacity: shape.ring === "emerald" ? shape.glow : 0 }}
      />

      <div className="relative h-[340px] w-[240px] [perspective:2500px] [transform-style:preserve-3d] sm:h-[380px] sm:w-[280px]">
        <motion.div
          className={cn(
            "relative h-full w-full [transform-style:preserve-3d] transition-[opacity,filter] duration-500",
            shape.wireframe ? "opacity-30 saturate-0" : "opacity-100",
          )}
          style={{
            rotateX: reduced ? 0 : rotateX,
            rotateY: reduced ? 0 : rotateY,
            transformPerspective: 2500,
          }}
        >
          {layers.map((layer, index) => (
            <motion.div
              key={layer.key}
              className="absolute left-1/2 top-1/2 h-[236px] w-[118px] sm:h-[264px] sm:w-[132px]"
              style={{
                transform: reduced
                  ? layerTransform(index, 0, 0, explodeTarget, screenTarget)
                  : transforms[index],
                transformOrigin: index >= 4 ? "50% 0%" : "50% 50%",
              }}
            >
              {layer.body}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
