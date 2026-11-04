import { cn } from "@/lib/utils";

/**
 * The poster's pictorial field: a repair shop's actual working drawing, a
 * device taken apart into its three layers, printed in cream line on ink with
 * one vermilion part marked. No photograph of this exists, so it is drawn as
 * the shop would draw it — flat, orthographic, registration marks in the trim.
 */
export function TeardownPlate({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 520"
      role="img"
      aria-label="Exploded drawing of a handheld device: screen, chassis and back panel, with the charging port marked for repair."
      className={cn("block h-full w-full", className)}
      fill="none"
    >
      {/* trim marks */}
      <g stroke="#CE3F1B" strokeWidth="1.7" opacity="0.9">
        <path d="M18 40V18h22M480 18h22v22M502 480v22h-22M40 502H18v-22" />
      </g>

      {/* layer 1 — display assembly, upper left */}
      <g stroke="#F1EBDD" strokeWidth="1.9" opacity="0.95">
        <rect x="74" y="64" width="126" height="228" rx="16" />
        <rect x="84" y="74" width="106" height="208" rx="10" opacity="0.55" />
        {/* speaker slot + camera */}
        <rect x="116" y="80" width="42" height="6" rx="3" />
        <circle cx="128" cy="96" r="4.5" />
        {/* home marker */}
        <rect x="126" y="268" width="22" height="4" rx="2" />
        {/* ribbon tail */}
        <path d="M137 292v28" />
      </g>

      {/* layer 2 — chassis with board, centre */}
      <g stroke="#F1EBDD" strokeWidth="1.9" opacity="0.95">
        <rect x="196" y="150" width="146" height="262" rx="16" />
        <rect x="208" y="162" width="122" height="238" rx="8" opacity="0.4" />

        {/* battery */}
        <rect x="216" y="236" width="106" height="102" rx="6" />
        <path d="M232 236v102M248 236v102M264 236v102M280 236v102M296 236v102" opacity="0.45" />
        <path d="M322 276h-10M322 292h-10" />

        {/* logic board */}
        <rect x="216" y="176" width="106" height="48" rx="4" opacity="0.75" />
        <path
          d="M224 186h18v10h16M224 200h12M224 212h46v-8h20M258 186v10h24M300 196v18h14"
          opacity="0.8"
        />
        <rect x="238" y="188" width="14" height="12" rx="2" />
        <rect x="282" y="200" width="12" height="10" rx="2" />

        {/* camera block */}
        <rect x="216" y="352" width="40" height="34" rx="4" />
        <circle cx="228" cy="364" r="5" />
        <circle cx="244" cy="364" r="5" />
        <circle cx="236" cy="376" r="4" />

        {/* marked fault: charging port */}
        <rect x="266" y="356" width="36" height="16" rx="3" stroke="#F07344" strokeWidth="2.6" />
        <circle cx="284" cy="364" r="2.4" fill="#F07344" stroke="none" />
      </g>

      {/* layer 3 — back panel with antenna lines, lower right */}
      <g stroke="#F1EBDD" strokeWidth="1.9" opacity="0.95">
        <rect x="332" y="238" width="126" height="228" rx="16" />
        <rect x="344" y="250" width="102" height="204" rx="8" opacity="0.35" />
        <path d="M344 286h102M344 418h102" opacity="0.55" />
        {/* screws */}
        <circle cx="354" cy="260" r="3.4" />
        <circle cx="436" cy="260" r="3.4" />
        <circle cx="354" cy="444" r="3.4" />
        <circle cx="436" cy="444" r="3.4" />
        {/* antenna window */}
        <path d="M344 300h102" strokeDasharray="3 5" opacity="0.7" />
      </g>

      {/* exploded leaders, dashed */}
      <g stroke="#9CAFAF" strokeWidth="1.4" strokeDasharray="3 6" opacity="0.75">
        <path d="M204 190 200 190M200 190 346 264" />
        <path d="M342 300 348 300" />
      </g>

      {/* callout from the marked part */}
      <g stroke="#F07344" strokeWidth="1.6" opacity="0.9">
        <path d="M302 364h44v-26" />
        <circle cx="348" cy="338" r="2.2" fill="#F07344" stroke="none" />
      </g>
    </svg>
  );
}
