"use client";

import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

/**
 * The page is legible in the server HTML. CSS adds a short entrance only
 * when motion is welcome; it doesn't have to wait for hydration to find out.
 */
export function PageTransition({
  children,
  fullHeight = false,
}: {
  children: React.ReactNode;
  fullHeight?: boolean;
}) {
  const pathname = usePathname();

  return (
    <div key={pathname} className={cn("workspace-arrival", fullHeight && "h-full")}>
      {children}
    </div>
  );
}
