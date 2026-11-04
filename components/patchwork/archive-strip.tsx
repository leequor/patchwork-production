import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * The shop's world, printed as a contact strip: four openly licensed
 * photographs multiplied onto cream stock so they print in the poster's two
 * inks. Full credits live in /archive/credits.json.
 */
const FRAMES = [
  {
    src: "/archive/hands.jpg",
    alt: "A watch repairer working at a cluttered bench under a lamp",
    title: "Traditional watch repairer at work in Goa — SerChevalerie, CC0",
    href: "https://commons.wikimedia.org/w/index.php?curid=161839784",
  },
  {
    src: "/archive/chassis.jpg",
    alt: "The inside of a valve radio chassis, tuning capacitor at its centre",
    title: "Tube radio chassis — HOSSEIN AKBAR, CC BY-SA 4.0",
    href: "https://commons.wikimedia.org/w/index.php?curid=99391481",
  },
  {
    src: "/archive/board.jpg",
    alt: "A printed circuit board, components and traces in close detail",
    title: "SEG DVD 430 printed circuit board — Raimond Spekking, CC BY-SA 4.0",
    href: "https://commons.wikimedia.org/w/index.php?curid=52852112",
  },
  {
    src: "/archive/bench.jpg",
    alt: "A workbench cluttered with tools, screws and parts mid-job",
    title: "Workbench cluttered with tools — Shixart1985, CC BY 2.0",
    href: "https://commons.wikimedia.org/w/index.php?curid=189764477",
  },
];

export function ArchiveStrip({
  className,
  height = "h-[104px] lg:h-[130px]",
}: {
  className?: string;
  height?: string;
}) {
  return (
    <div className={cn("mt-5", className)}>
      <div className="grid grid-cols-4 gap-2">
        {FRAMES.map((frame, index) => (
          <a
            key={frame.src}
            href={frame.href}
            target="_blank"
            rel="noreferrer"
            title={frame.title}
            className={cn("relative block overflow-hidden bg-ink", height)}
          >
            <Image
              src={frame.src}
              alt={frame.alt}
              fill
              sizes="(min-width: 1024px) 22vw, 25vw"
              className="photo-print object-cover"
              style={{ animationDelay: `${140 + index * 70}ms` }}
            />
          </a>
        ))}
      </div>

      <p className="mt-2 truncate font-sans text-[13px] leading-5 text-ink-secondary/70">
        Photographs from Wikimedia Commons —{" "}
        <a
          className="underline underline-offset-2 transition-colors hover:text-ink"
          href="/archive/credits.json"
        >
          credits
        </a>
      </p>
    </div>
  );
}
