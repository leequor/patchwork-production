"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/**
 * The repair tree.
 *
 * A rendered blossom tree — coral trunk, backlit pink canopy, petals in the air —
 * composited over the page with `screen`, so its black background disappears and
 * only the light remains. Two layers of motion sit on top of the still render:
 *
 *  1. A slow breathing sway on the artwork itself (24s, ±1.5°), so the canopy is
 *     never perfectly frozen.
 *  2. A canvas of petals falling through the foreground, plus a pointer parallax
 *     that moves the art and the petals by different amounts.
 *
 * Why a rendered image rather than geometry: a blossom canopy is a lighting
 * problem before it is a modelling problem. The canvas L-system I built first
 * read as smoke, because soft blooms without real bounce light always do. This
 * keeps the light that a renderer spent its time on.
 *
 * Craft notes:
 *  - `mix-blend-mode: screen` is what makes the cut-out work without an alpha
 *    channel: black contributes nothing, and the page's own light shows through
 *    the canopy.
 *  - Petals are the only thing painted per frame; the render itself is a static
 *    image, so the hero costs one composited layer plus ~60 small gradients.
 *  - `prefers-reduced-motion`: no sway, no petals, no parallax — just the tree.
 *  - Decorative, so `aria-hidden`; the headline carries the meaning.
 */

type Petal = {
  x: number;
  y: number;
  size: number;
  drift: number;
  fall: number;
  phase: number;
  warm: boolean;
};

export function RepairTree({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const art = artRef.current;
    if (!canvas || !art) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let petals: Petal[] = [];
    let frame = 0;
    let dpr = 1;

    const pointer = { x: 0.5, y: 0.5 };
    const eased = { x: 0.5, y: 0.5 };

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      if (!width || !height) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      petals = Array.from({ length: Math.round(Math.min(64, width / 12)) }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 0.7 + Math.random() * 2.2,
        drift: 6 + Math.random() * 22,
        fall: 5 + Math.random() * 15,
        phase: Math.random() * Math.PI * 2,
        warm: Math.random() > 0.55,
      }));
    };

    const draw = (time: number, dt: number) => {
      const ease = 1 - Math.exp(-3 * dt);
      eased.x += (pointer.x - eased.x) * ease;
      eased.y += (pointer.y - eased.y) * ease;

      art.style.setProperty("--px", `${((eased.x - 0.5) * 22).toFixed(2)}px`);
      art.style.setProperty("--py", `${((eased.y - 0.5) * 12).toFixed(2)}px`);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      for (const petal of petals) {
        const sway = Math.sin(time * 0.00055 + petal.phase) * petal.drift;
        const x = (((petal.x + sway) % width) + width) % width;
        const y = petal.y + (eased.y - 0.5) * 10;
        const alpha = 0.22 + Math.sin(time * 0.001 + petal.phase) * 0.16;
        const spread = petal.size * 4.5;

        const glow = ctx.createRadialGradient(x, y, 0, x, y, spread);
        glow.addColorStop(
          0,
          petal.warm ? `rgba(255, 214, 232, ${Math.max(alpha, 0.05)})` : `rgba(236, 208, 255, ${Math.max(alpha, 0.05)})`,
        );
        glow.addColorStop(
          0.45,
          petal.warm ? `rgba(255, 142, 186, ${Math.max(alpha * 0.3, 0.02)})` : `rgba(198, 160, 255, ${Math.max(alpha * 0.3, 0.02)})`,
        );
        glow.addColorStop(1, "rgba(120, 60, 120, 0)");
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
        petal.y += petal.fall * dt * 7;
        if (petal.y > height + 14) {
          petal.y = -14;
          petal.x = Math.random() * width;
        }
      }
      draw(time, dt);
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
    const onVisibility = () => (document.hidden ? stop() : start());

    resize();
    draw(0, 0.016);

    if (!reduced) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      start();
    }

    const observer = new ResizeObserver(() => {
      resize();
      draw(performance.now(), 0.016);
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

  return (
    <div className={className} aria-hidden="true">
      <div ref={artRef} className="tree-art absolute inset-x-0 -top-[14%] h-[130%]">
        <Image
          src="/art/repair-tree.jpg"
          alt=""
          fill
          priority
          sizes="(max-width: 640px) 110vw, (max-width: 1024px) 78vw, 58vw"
          className="object-cover object-[62%_40%] [mix-blend-mode:screen] sm:object-[58%_38%]"
        />
      </div>

      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* The render's black areas composite with `screen`, so the page's own
          light shows through. Give it violet to show through, not the cyan
          corner spill. */}
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(58%_60%_at_58%_45%,rgba(110,92,247,0.16),transparent_72%)]"
        aria-hidden="true"
      />

      {/* A little warmth under the trunk, so the tree is standing in light. */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/3 bg-[radial-gradient(60%_100%_at_50%_120%,rgba(255,150,190,0.16),transparent_70%)]"
        aria-hidden="true"
      />
    </div>
  );
}
