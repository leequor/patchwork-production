"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function read() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(QUERY).matches;
}

/**
 * Read the user's motion preference without writing state from an effect, so
 * the answer is correct on the first browser paint. Server render assumes
 * motion (there is nothing to animate yet) and hydrates to the truth.
 */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, read, () => false);
}
