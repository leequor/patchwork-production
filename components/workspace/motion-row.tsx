"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

const SPRING = { type: "spring", stiffness: 420, damping: 24, mass: 0.4 } as const;

/** A table row that lifts 0.5% under the pointer. */
export function MotionRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();

  return (
    <motion.tr
      className={className}
      whileHover={reduced ? undefined : { scale: 1.005 }}
      transition={SPRING}
    >
      {children}
    </motion.tr>
  );
}

/** The ledger equivalent for list-based tables. */
export function MotionItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();

  return (
    <motion.li
      className={className}
      whileHover={reduced ? undefined : { scale: 1.005 }}
      transition={SPRING}
    >
      {children}
    </motion.li>
  );
}
