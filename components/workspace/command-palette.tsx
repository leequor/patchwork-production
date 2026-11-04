"use client";

import { CornerDownLeft, Search, Ticket } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { NAV_ITEMS } from "./nav";

type Result = {
  href: string;
  label: string;
  meta: string;
  icon: typeof Search;
};

/**
 * Cmd+K. Searches the six rooms of the shop and, when the term is free text,
 * hands it to the ticket table's own search rather than faking results.
 */
export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo<Result[]>(() => {
    const term = query.trim().toLowerCase();
    const pages: Result[] = NAV_ITEMS.filter(
      (item) =>
        !term ||
        item.label.toLowerCase().includes(term) ||
        item.short.toLowerCase().includes(term),
    ).map((item) => ({
      href: item.href,
      label: item.label,
      meta: item.short,
      icon: item.icon,
    }));

    if (!term) return pages;

    return [
      ...pages,
      {
        href: `/tickets?q=${encodeURIComponent(query.trim())}`,
        label: `Search tickets for “${query.trim()}”`,
        meta: "Ticket, customer, device",
        icon: Ticket,
      },
    ];
  }, [query]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(results.length - 1, index + 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(0, index - 1));
    }
    if (event.key === "Enter") {
      const result = results[active];
      if (result) {
        event.preventDefault();
        go(result.href);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh]">
      <button
        type="button"
        aria-label="Close search overlay"
        onClick={onClose}
        className="absolute inset-0 bg-canvas/70 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search Patchwork"
        className="relative w-full max-w-[560px] overflow-hidden rounded-2xl border border-hairline-strong bg-panel/95 shadow-float backdrop-blur-2xl"
      >
        <div className="flex items-center gap-3 border-b border-hairline px-4">
          <Search className="h-4 w-4 shrink-0 text-ink-tertiary" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search tickets, customers, pages…"
            aria-label="Search Patchwork"
            className="h-14 min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-faint"
          />
          <kbd className="rounded border border-hairline bg-raised px-1.5 py-0.5 font-mono text-[10px] text-ink-faint">
            ESC
          </kbd>
        </div>

        <ul role="listbox" aria-label="Results" className="max-h-[320px] overflow-y-auto p-2">
          {results.map((result, index) => {
            const Icon = result.icon;
            return (
              <li key={result.href}>
                <button
                  type="button"
                  role="option"
                  aria-selected={index === active}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => go(result.href)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-100",
                    index === active ? "bg-raised" : "hover:bg-raised/60",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-7 w-7 shrink-0 place-items-center rounded-md border border-hairline",
                      index === active
                        ? "border-accent/40 bg-accent-soft text-accent-bright"
                        : "text-ink-tertiary",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-ink">
                      {result.label}
                    </span>
                    <span className="block truncate text-[11px] text-ink-tertiary">
                      {result.meta}
                    </span>
                  </span>
                  {index === active ? (
                    <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-ink-faint" aria-hidden="true" />
                  ) : null}
                </button>
              </li>
            );
          })}
          {results.length === 0 ? (
            <li className="px-3 py-8 text-center text-[13px] text-ink-tertiary">No matches.</li>
          ) : null}
        </ul>

        <div className="flex items-center gap-4 border-t border-hairline px-4 py-2.5 text-[11px] text-ink-faint">
          <span className="flex items-center gap-1.5">
            <CornerDownLeft className="h-3 w-3" aria-hidden="true" /> open
          </span>
          <span>↑ ↓ navigate</span>
          <span className="ml-auto">esc close</span>
        </div>
      </div>
    </div>
  );
}
