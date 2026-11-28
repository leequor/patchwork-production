"use client";

import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { useRef, useState } from "react";

import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/**
 * The room.
 *
 * A looping 7.5-second, 30 fps render of a blossom tree — coral trunk, backlit pink
 * canopy, petals drifting through the frame — used as the hero artwork at full
 * bleed. An eased half-second tail-to-head blend and motion interpolation across
 * the wrap preserve continuous motion through all 225 frames. It is the
 * reference's own footage, which is why it finally matches:
 * canopy, crop and motion are already composed for a wide frame, and no amount
 * of procedural drawing gets there.
 *
 * `prefers-reduced-motion` swaps the video for a still of the same tree. Same
 * picture, no movement, no decoding cost.
 *
 * Decorative: `aria-hidden`, and the headline carries the meaning.
 */
export function RepairTree({ className, controlPosition }: { className: string; controlPosition: string }) {
  const reduced = usePrefersReducedMotion();
  const player = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  function togglePlayback() {
    const video = player.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => setPlaying(false));
    else video.pause();
  }

  return (
    <>
      <div className={className} aria-hidden="true">
        {reduced ? (
          <Image
            src="/art/sakura-still.webp"
            alt=""
            fill
            unoptimized
            loading="eager"
            className="object-cover object-[52%_44%]"
          />
        ) : (
          <video
            ref={player}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onLoadedData={(event) => setPlaying(!event.currentTarget.paused)}
            className="h-full w-full object-cover object-[68%_center] sm:object-center"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/art/sakura-still.webp"
          >
            <source media="(prefers-reduced-motion: no-preference)" src="/art/hero-sakura.mp4" type="video/mp4" />
          </video>
        )}
      </div>
      {!reduced && (
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={playing ? "Pause garden film" : "Play garden film"}
          title={playing ? "Pause garden film" : "Play garden film"}
          className={`absolute z-20 grid size-11 place-items-center rounded-full bg-canvas/80 text-ink ring-1 ring-inset ring-white/20 transition-colors hover:bg-raised ${controlPosition}`}
        >
          {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
        </button>
      )}
    </>
  );
}
