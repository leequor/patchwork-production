"use client";

import { useEffect, useRef } from "react";

import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Dust that notices you.
 *
 * A near field of motes over the hero: each one drifts on its own slow sway, and
 * anything within 300px of the pointer is pulled gently toward it, then damped
 * back into the drift. The radius matters more than the force — you want dust
 * disturbed by a hand, not particles chasing a cursor.
 *
 * Brightness is a function of distance, so the field has a soft centre that
 * follows the hand. Additive blending keeps it as light rather than dots.
 *
 * Performance: one canvas, two cached glow sprites, and one pointer halo per
 * frame. The loop stops when the tab is hidden; reduced motion leaves the field
 * still, and touch devices keep only the slow drift.
 */

type Mote = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  cool: boolean;
  phase: number;
};

const RADIUS = 300;
const FORCE = 30;

export function PointerDust({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduced) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let motes: Mote[] = [];
    let frame = 0;
    let previous = performance.now();
    const started = previous;

    const pointer = { x: 0.5, y: 0.5 };
    const eased = { x: 0.5, y: 0.5 };
    /* Where the hand was last frame, so a fast pass can leave a wake. */
    const previousHand = { x: 0.5, y: 0.5 };
    let handSpeed = 0;
    let pointerActive = false;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;

    const makeGlow = (color: string) => {
      const size = 48;
      const sprite = document.createElement("canvas");
      sprite.width = size;
      sprite.height = size;
      const spriteContext = sprite.getContext("2d");
      if (!spriteContext) return sprite;

      const glow = spriteContext.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      glow.addColorStop(0, `rgba(${color}, 0.92)`);
      glow.addColorStop(0.28, `rgba(${color}, 0.32)`);
      glow.addColorStop(0.72, `rgba(${color}, 0.035)`);
      glow.addColorStop(1, "rgba(110, 92, 247, 0)");
      spriteContext.fillStyle = glow;
      spriteContext.fillRect(0, 0, size, size);
      return sprite;
    };

    const violetGlow = makeGlow("206, 190, 255");
    const coolGlow = makeGlow("69, 211, 232");

    const seed = () => {
      const oldWidth = width;
      const oldHeight = height;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      if (!width || !height) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      if (motes.length && oldWidth && oldHeight) {
        for (const mote of motes) {
          mote.x = (mote.x / oldWidth) * width;
          mote.y = (mote.y / oldHeight) * height;
        }
        return;
      }

      const count = Math.round(Math.min(72, Math.max(18, width / 20)));
      motes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        size: 0.8 + Math.random() * 1.6,
        cool: Math.random() > 0.74,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const draw = (dt: number, elapsed: number) => {
      const ease = 1 - Math.exp(-6 * dt);
      eased.x += (pointer.x - eased.x) * ease;
      eased.y += (pointer.y - eased.y) * ease;

      const cx = eased.x * width;
      const cy = eased.y * height;

      /* A hand that moves fast pushes dust aside. Smoothed so a single jittery
         event does not blow the field apart. */
      const travel = Math.hypot(pointer.x - previousHand.x, pointer.y - previousHand.y) * Math.max(width, height);
      previousHand.x = pointer.x;
      previousHand.y = pointer.y;
      const speedTarget = pointerActive
        ? Math.min(travel / Math.max(dt, 0.008) / 2600, 1)
        : 0;
      handSpeed += (speedTarget - handSpeed) * (1 - Math.exp(-8 * dt));

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      if (pointerActive) {
        /* The gathering itself: one soft violet pool follows the hand. */
        const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, 360);
        halo.addColorStop(0, "rgba(122, 106, 255, 0.055)");
        halo.addColorStop(0.5, "rgba(96, 84, 220, 0.022)");
        halo.addColorStop(1, "rgba(96, 84, 220, 0)");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(cx, cy, 360, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const mote of motes) {
        const dx = cx - mote.x;
        const dy = cy - mote.y;
        const distance = Math.hypot(dx, dy);

        if (pointerActive && distance < RADIUS && distance > 1) {
          const force = (1 - distance / RADIUS) * FORCE;
          mote.vx += (dx / distance) * force * dt;
          mote.vy += (dy / distance) * force * dt;

          if (handSpeed > 0.02) {
            const wake = (1 - distance / RADIUS) * handSpeed * 520 * dt;
            mote.vx -= (dx / distance) * wake;
            mote.vy -= (dy / distance) * wake;
          }
        }

        mote.vx += Math.sin(elapsed * 0.5 + mote.phase) * 2.4 * dt;
        mote.vy += Math.cos(elapsed * 0.42 + mote.phase) * 2 * dt;
        mote.vx *= Math.exp(-1.6 * dt);
        mote.vy *= Math.exp(-1.6 * dt);

        mote.x += mote.vx * dt;
        mote.y += mote.vy * dt;

        if (mote.x < -20) mote.x = width + 20;
        if (mote.x > width + 20) mote.x = -20;
        if (mote.y < -20) mote.y = height + 20;
        if (mote.y > height + 20) mote.y = -20;

        const near = pointerActive && distance < RADIUS ? 1 - distance / RADIUS : 0;
        ctx.globalAlpha = 0.09 + near * 0.34;
        const radius = mote.size * 7;
        ctx.drawImage(
          mote.cool ? coolGlow : violetGlow,
          mote.x - radius,
          mote.y - radius,
          radius * 2,
          radius * 2,
        );
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    const step = (time: number) => {
      const dt = Math.min((time - previous) / 1000, 0.05);
      previous = time;
      draw(dt, (time - started) / 1000);
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

    const onPointer = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointer.x = event.clientX / window.innerWidth;
      pointer.y = event.clientY / window.innerHeight;
      pointerActive = true;
    };
    const onPointerLeave = () => {
      pointer.x = 0.5;
      pointer.y = 0.5;
      pointerActive = false;
      handSpeed = 0;
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    seed();
    window.addEventListener("resize", seed);
    if (!coarsePointer) window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      stop();
      window.removeEventListener("resize", seed);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
