"use client";

import { useEffect, useRef } from "react";

import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Dust that notices you.
 *
 * A near field of motes over the hero: each one drifts on its own slow sway, and
 * anything within 260px of the pointer is pulled gently toward it, then damped
 * back into the drift. The radius matters more than the force — you want dust
 * disturbed by a hand, not particles chasing a cursor.
 *
 * Brightness is a function of distance, so the field has a soft centre that
 * follows the hand. Additive blending keeps it as light rather than dots.
 *
 * Performance: one canvas, dots only, no gradients larger than 14px radius, and
 * the loop stops when the tab is hidden. `prefers-reduced-motion` never starts
 * it — the hero still has the artwork, it simply has no dust.
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

    const seed = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      if (!width || !height) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      motes = Array.from({ length: Math.round(Math.min(110, width / 16)) }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        size: 1.1 + Math.random() * 2.6,
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
      const travel =
        Math.hypot(pointer.x - previousHand.x, pointer.y - previousHand.y) *
        Math.max(width, height);
      previousHand.x = pointer.x;
      previousHand.y = pointer.y;
      handSpeed += (Math.min(travel / Math.max(dt, 0.008) / 2600, 1) - handSpeed) * 0.14;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      /* The gathering itself: a very soft violet pool the motes sit in. */
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, 360);
      halo.addColorStop(0, "rgba(122, 106, 255, 0.14)");
      halo.addColorStop(0.5, "rgba(96, 84, 220, 0.055)");
      halo.addColorStop(1, "rgba(96, 84, 220, 0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, 360, 0, Math.PI * 2);
      ctx.fill();

      for (const mote of motes) {
        const dx = cx - mote.x;
        const dy = cy - mote.y;
        const distance = Math.hypot(dx, dy);

        if (distance < RADIUS && distance > 1) {
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
        mote.vx *= 1 - Math.min(0.9, 1.6 * dt);
        mote.vy *= 1 - Math.min(0.9, 1.6 * dt);

        mote.x += mote.vx * dt;
        mote.y += mote.vy * dt;

        if (mote.x < -20) mote.x = width + 20;
        if (mote.x > width + 20) mote.x = -20;
        if (mote.y < -20) mote.y = height + 20;
        if (mote.y > height + 20) mote.y = -20;

        const near = distance < RADIUS ? 1 - distance / RADIUS : 0;
        const alpha = 0.18 + near * 0.8;
        const glow = ctx.createRadialGradient(mote.x, mote.y, 0, mote.x, mote.y, mote.size * 7);
        glow.addColorStop(
          0,
          mote.cool ? `rgba(69, 211, 232, ${alpha})` : `rgba(206, 190, 255, ${alpha})`,
        );
        glow.addColorStop(1, "rgba(110, 92, 247, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(mote.x, mote.y, mote.size * 7, 0, Math.PI * 2);
        ctx.fill();
      }

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
      pointer.x = event.clientX / window.innerWidth;
      pointer.y = event.clientY / window.innerHeight;
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    seed();
    window.addEventListener("resize", seed);
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      stop();
      window.removeEventListener("resize", seed);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
