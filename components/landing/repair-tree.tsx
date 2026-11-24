"use client";

import Image from "next/image";

import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/**
 * The room.
 *
 * A looping 8-second render of a blossom tree — coral trunk, backlit pink
 * canopy, petals drifting through the frame — used as the hero artwork at full
 * bleed. It is the reference's own footage, which is why it finally matches:
 * canopy, crop and motion are already composed for a wide frame, and no amount
 * of procedural drawing gets there.
 *
 * `prefers-reduced-motion` swaps the video for a still of the same tree. Same
 * picture, no movement, no decoding cost.
 *
 * Decorative: `aria-hidden`, and the headline carries the meaning.
 */
export function RepairTree({ className }: { className?: string }) {
  const reduced = usePrefersReducedMotion();

  return (
    <div className={className} aria-hidden="true">
      {reduced ? (
        <Image
          src="/art/sakura-tree.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[52%_44%]"
        />
      ) : (
        <video
          className="h-full w-full object-cover object-[68%_center] sm:object-center"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/art/sakura-tree.png"
        >
          <source src="/art/hero-sakura.mp4" type="video/mp4" />
        </video>
      )}
    </div>
  );
}
