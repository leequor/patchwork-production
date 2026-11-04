"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

const GROUP: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

const ITEM: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 28, mass: 0.8 },
  },
};

export function StaggerGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();

  return (
    <motion.div
      className={className}
      variants={GROUP}
      initial={reduced ? false : "hidden"}
      animate="show"
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={ITEM}>
      {children}
    </motion.div>
  );
}
