"use client";

import { useState } from "react";

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-sm bg-wash px-2.5 py-1 font-sans text-[13px] text-muted transition-colors hover:text-ink"
      aria-label={`${label} ${value}`}
    >
      {copied ? "Copied" : label}
    </button>
  );
}
