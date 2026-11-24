"use client";

import { useEffect, useRef } from "react";

import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/**
 * The repair tree.
 *
 * A blossom tree grown from a seeded L-system, drawn to a canvas the way a
 * cinematographer would light it: a violet trunk that brightens to lilac at the
 * tips, blossom clusters added with `lighter` compositing so they bloom, and a
 * slow fall of glowing petals that catches the light on the way down.
 *
 * Why a tree, in a repair shop: every ticket on the bench is a branch — intake
 * at the trunk, one stage per fork, a device back in the customer's hands at
 * the tip. It is also simply the most beautiful thing we can put on a black
 * page.
 *
 * Craft notes:
 *
 *  - The tree itself is drawn **once** to an offscreen canvas per resize. Only
 *    the petals animate, so a full-screen hero costs one drawImage per frame.
 *  - Depth pixel ratio aware, capped at 2 so a 4K laptop does not paint 8 Mpx
 *    of blossom twice a second.
 *  - `prefers-reduced-motion`: the tree is still there, perfectly still.
 *  - Decorative, so it is hidden from assistive tech; the headline carries the
 *    meaning.
 */

const BRANCH = {
  depth: 6,
  /** Length of the first trunk segment, as a fraction of canvas height. */
  trunk: 0.2,
  /** How much shorter each fork is. */
  shrink: 0.74,
  /** Half-angle at each fork, in radians. */
  spread: 0.52,
};

/** Small deterministic PRNG so the tree is the same on every render. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Tip = { x: number; y: number; scale: number };
type Petal = {
  x: number;
  y: number;
  size: number;
  drift: number;
  fall: number;
  phase: number;
  hue: number;
};

function mix(from: [number, number, number], to: [number, number, number], t: number) {
  return `rgb(${Math.round(from[0] + (to[0] - from[0]) * t)}, ${Math.round(
    from[1] + (to[1] - from[1]) * t,
  )}, ${Math.round(from[2] + (to[2] - from[2]) * t)})`;
}

const TRUNK_DARK: [number, number, number] = [44, 26, 82];
const TRUNK_LIGHT: [number, number, number] = [176, 156, 255];

/** Draws one tapered branch and recurses; returns the tips it reached. */
function grow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  length: number,
  width: number,
  depth: number,
  random: () => number,
  tips: Tip[],
) {
  const bend = (random() - 0.5) * 0.5;
  const midX = x + Math.cos(angle + bend * 0.5) * length * 0.55;
  const midY = y + Math.sin(angle + bend * 0.5) * length * 0.55;
  const endX = x + Math.cos(angle + bend) * length;
  const endY = y + Math.sin(angle + bend) * length;

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(midX, midY, endX, endY);
  ctx.lineWidth = Math.max(width, 0.55);
  ctx.lineCap = "round";
  ctx.strokeStyle = mix(TRUNK_DARK, TRUNK_LIGHT, 1 - depth / BRANCH.depth);
  ctx.stroke();

  if (depth <= 0) {
    tips.push({ x: endX, y: endY, scale: 0.6 + random() * 0.9 });
    return;
  }

  const children = depth > 3 ? 2 : random() > 0.35 ? 2 : 3;
  for (let index = 0; index < children; index += 1) {
    const sign = index % 2 === 0 ? -1 : 1;
    const offset = sign * (BRANCH.spread * (0.6 + random() * 0.8));
    grow(
      ctx,
      endX,
      endY,
      angle + offset + (random() - 0.5) * 0.18,
      length * (BRANCH.shrink + random() * 0.06),
      width * 0.66,
      depth - 1,
      random,
      tips,
    );
  }
}

/** A blossom cluster: many soft circles, blended additively. */
function blossom(ctx: CanvasRenderingContext2D, tip: Tip, random: () => number) {
  const count = 5 + Math.floor(random() * 6);
  for (let index = 0; index < count; index += 1) {
    const angle = random() * Math.PI * 2;
    const distance = random() * 16 * tip.scale;
    const radius = (2.2 + random() * 4.4) * tip.scale;
    const x = tip.x + Math.cos(angle) * distance;
    const y = tip.y + Math.sin(angle) * distance * 0.8;

    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 2.4);
    const warm = random() > 0.72;
    glow.addColorStop(0, warm ? "rgba(228, 176, 255, 0.95)" : "rgba(190, 172, 255, 0.92)");
    glow.addColorStop(0.35, warm ? "rgba(186, 122, 244, 0.5)" : "rgba(140, 118, 246, 0.45)");
    glow.addColorStop(1, "rgba(110, 92, 247, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, radius * 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function RepairTree({ className }: { className?: string }) {
  const hostRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = hostRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let still: HTMLCanvasElement | null = null;
    let petals: Petal[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;

    const pointer = { x: 0.5, y: 0.5 };
    const eased = { x: 0.5, y: 0.5 };

    /** Everything that does not move: trunk, branches, blossom, ground. */
    const paintStill = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      if (!width || !height) return;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      still = document.createElement("canvas");
      still.width = canvas.width;
      still.height = canvas.height;
      const sctx = still.getContext("2d");
      if (!sctx) return;
      sctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const random = mulberry32(20261124);
      const baseX = width * 0.52;
      const baseY = height * 0.995;

      /* The light the tree sits in. */
      const halo = sctx.createRadialGradient(
        baseX,
        height * 0.44,
        0,
        baseX,
        height * 0.44,
        Math.max(width, height) * 0.62,
      );
      halo.addColorStop(0, "rgba(110, 92, 247, 0.3)");
      halo.addColorStop(0.45, "rgba(110, 92, 247, 0.09)");
      halo.addColorStop(1, "rgba(110, 92, 247, 0)");
      sctx.fillStyle = halo;
      sctx.fillRect(0, 0, width, height);

      /* Ground: a low mound, darker than the light behind it. */
      const mound = sctx.createRadialGradient(
        baseX,
        baseY,
        0,
        baseX,
        baseY,
        width * 0.42,
      );
      mound.addColorStop(0, "rgba(14, 9, 28, 0.95)");
      mound.addColorStop(0.55, "rgba(10, 7, 20, 0.7)");
      mound.addColorStop(1, "rgba(9, 8, 15, 0)");
      sctx.fillStyle = mound;
      sctx.beginPath();
      sctx.ellipse(baseX, baseY, width * 0.4, height * 0.1, 0, Math.PI, 0);
      sctx.fill();

      const tips: Tip[] = [];
      grow(
        sctx,
        baseX,
        baseY,
        -Math.PI / 2,
        height * BRANCH.trunk,
        Math.max(6, height * 0.016),
        BRANCH.depth,
        random,
        tips,
      );

      /* Blossom after the whole skeleton exists, so no branch paints over it. */
      sctx.globalCompositeOperation = "lighter";
      tips.forEach((tip) => blossom(sctx, tip, random));
      sctx.globalCompositeOperation = "source-over";

      petals = Array.from({ length: Math.round(Math.min(90, width / 14)) }, () => ({
        x: random() * width,
        y: random() * height,
        size: 0.8 + random() * 2.4,
        drift: (random() - 0.5) * 14,
        fall: 6 + random() * 16,
        phase: random() * Math.PI * 2,
        hue: random(),
      }));
    };

    const drawPetals = (time: number, dt: number) => {
      const ease = 1 - Math.exp(-3.2 * dt);
      eased.x += (pointer.x - eased.x) * ease;
      eased.y += (pointer.y - eased.y) * ease;
      const shiftX = (eased.x - 0.5) * 26;
      const shiftY = (eased.y - 0.5) * 12;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (still) ctx.drawImage(still, shiftX * 0.35, shiftY * 0.35);

      ctx.setTransform(
        Math.min(window.devicePixelRatio || 1, 2),
        0,
        0,
        Math.min(window.devicePixelRatio || 1, 2),
        shiftX * 1.6,
        shiftY * 1.6,
      );
      ctx.globalCompositeOperation = "lighter";

      for (const petal of petals) {
        const sway = Math.sin(time * 0.0006 + petal.phase) * petal.drift;
        const x = ((petal.x + sway + width) % width + width) % width;
        const y = petal.y;

        const alpha = 0.25 + Math.sin(time * 0.001 + petal.phase) * 0.18;
        const spread = petal.size * 5;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, spread);
        glow.addColorStop(0, `rgba(235, 214, 255, ${Math.max(alpha, 0.06)})`);
        glow.addColorStop(0.4, `rgba(170, 140, 255, ${Math.max(alpha * 0.35, 0.02)})`);
        glow.addColorStop(1, "rgba(120, 92, 247, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, spread, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
    };

    const step = (time: number, previous: number) => {
      const dt = Math.min((time - previous) / 1000, 0.05);
      for (const petal of petals) {
        petal.y += petal.fall * dt * 6;
        if (petal.y > height + 12) {
          petal.y = -12;
          petal.x = Math.random() * width;
        }
      }
      drawPetals(time, dt);
      frame = requestAnimationFrame((next) => step(next, time));
    };

    const start = () => {
      if (frame || reduced) return;
      frame = requestAnimationFrame((time) => step(time, time));
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const onPointer = (event: PointerEvent) => {
      pointer.x = event.clientX / window.innerWidth;
      pointer.y = event.clientY / window.innerHeight;
    };
    const onVisibility = () => {
      visible = !document.hidden;
      if (visible) start();
      else stop();
    };

    paintStill();
    drawPetals(0, 0.016);
    if (!reduced) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      start();
    }

    const observer = new ResizeObserver(() => {
      paintStill();
      drawPetals(performance.now(), 0.016);
    });
    observer.observe(canvas);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  return <canvas ref={hostRef} aria-hidden="true" className={className} />;
}
