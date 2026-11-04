"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Every route arrives the same way: 10px up and a quarter-second of light.
 * Keyed on the pathname so it replays on navigation, and skipped entirely
 * when the visitor asked for reduced motion.
 */
export function PageTransition({
  children,
  fullHeight = false,
}: {
  children: React.ReactNode;
  fullHeight?: boolean;
}) {
  const pathname = usePathname();
  const reduced = usePrefersReducedMotion();

  return (
    <motion.div
      key={pathname}
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 30, mass: 0.9 }}
      className={cn(fullHeight && "h-full")}
    >
      {children}
    </motion.div>
  );
}
