"use client";

import { CornerDownLeft, Search, Ticket } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { previewHref } from "@/lib/preview/navigation";

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
export function CommandPalette({
  open,
  onClose,
  preview = false,
}: {
  open: boolean;
  onClose: () => void;
  preview?: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
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
      href: preview ? previewHref(item.href) : item.href,
      label: item.label,
      meta: item.short,
      icon: item.icon,
    }));

    if (!term) return pages;

    return [
      ...pages,
      {
        href: preview
          ? previewHref(`/tickets?q=${encodeURIComponent(query.trim())}`)
          : `/tickets?q=${encodeURIComponent(query.trim())}`,
        label: `Search tickets for “${query.trim()}”`,
        meta: "Ticket, customer, device",
        icon: Ticket,
      },
    ];
  }, [preview, query]);

  useEffect(() => {
    if (open) {
      restoreFocusRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
      return () => window.cancelAnimationFrame(frame);
    }

    const restore = restoreFocusRef.current;
    restoreFocusRef.current = null;
    if (restore?.isConnected) restore.focus();
  }, [open]);

  /* Closing always clears the field, including Escape from outside the input. */
  const close = () => {
    setQuery("");
    setActive(0);
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setQuery("");
        setActive(0);
        onClose();
      } else if (event.key === "Tab") {
        /* The search field is the palette's only tab stop. Options use the
           combobox's arrow-key model so the active item never loses context. */
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const go = (href: string) => {
    close();
    router.push(href);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      if (results.length === 0) return;
      event.preventDefault();
      setActive((index) => Math.min(results.length - 1, index + 1));
    }
    if (event.key === "ArrowUp") {
      if (results.length === 0) return;
      event.preventDefault();
      setActive((index) => Math.max(0, index - 1));
    }
    if (event.key === "Home" && results.length > 0) {
      event.preventDefault();
      setActive(0);
    }
    if (event.key === "End" && results.length > 0) {
      event.preventDefault();
      setActive(results.length - 1);
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
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search Patchwork"
      className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh]"
    >
      <button
        type="button"
        aria-label="Close search overlay"
        tabIndex={-1}
        onClick={close}
        className="absolute inset-0 bg-canvas/70"
      />

      <div
        className="command-palette relative w-full max-w-[560px] overflow-hidden rounded-lg bg-panel shadow-float ring-1 ring-inset ring-white/[0.08]"
      >
        <div className="flex items-center gap-3 border-b border-hairline px-4">
          <Search className="h-4 w-4 shrink-0 text-ink-tertiary" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search tickets, customers, pages…"
            aria-label="Search Patchwork"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={results.length > 0}
            aria-controls="command-palette-results"
            aria-activedescendant={results.length > 0 ? `command-option-${active}` : undefined}
            className="h-14 min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-faint"
          />
          <kbd className="rounded bg-raised ring-1 ring-inset ring-white/[0.07] px-1.5 py-0.5 font-mono text-[10px] text-ink-faint">
            ESC
          </kbd>
        </div>

        <ul
          id="command-palette-results"
          role="listbox"
          aria-label="Results"
          className="max-h-[320px] overflow-y-auto p-2"
        >
          {results.map((result, index) => {
            const Icon = result.icon;
            return (
              <li
                key={result.href}
                id={`command-option-${index}`}
                role="option"
                aria-selected={index === active}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActive(index)}
                onClick={() => go(result.href)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors duration-100",
                  index === active ? "bg-raised" : "hover:bg-raised/60",
                )}
              >
                <span
                  className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-md bg-white/[0.04] ring-1 ring-inset ring-white/[0.07]",
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
              </li>
            );
          })}
          {results.length === 0 ? (
            <li role="status" className="px-3 py-8 text-center text-[13px] text-ink-tertiary">
              No matches.
            </li>
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
