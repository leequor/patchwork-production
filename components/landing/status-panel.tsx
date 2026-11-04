"use client";

import { TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type AppHealth = {
  status: string;
  service: string;
  timestamp: string;
};

type SupabaseHealth = {
  status: "connected" | "not_configured" | "unavailable";
  latencyMs?: number;
  message?: string;
};

const STATE_LABEL = {
  loading: "Checking",
  ok: "Ready",
  warn: "Warning",
  error: "Down",
} as const;

const TONE = {
  loading: "text-ink-secondary",
  ok: "text-positive",
  warn: "text-warn",
  error: "text-negative",
} as const;

const DOT = {
  loading: "bg-ink-tertiary",
  ok: "bg-positive",
  warn: "bg-warn",
  error: "bg-negative",
} as const;

function StatusRow({
  label,
  state,
  detail,
}: {
  label: string;
  state: keyof typeof STATE_LABEL;
  detail: string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3.5">
      <div>
        <p className="text-[15px] font-medium text-ink">{label}</p>
        <p className="mt-0.5 max-w-[58ch] font-sans text-[15px] leading-6 text-ink-secondary">{detail}</p>
      </div>
      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em]",
          TONE[state],
        )}
      >
        <span className={cn("h-1.5 w-1.5", DOT[state])} aria-hidden="true" />
        {STATE_LABEL[state]}
      </span>
    </div>
  );
}

export function StatusPanel() {
  const [app, setApp] = useState<AppHealth | null>(null);
  const [database, setDatabase] = useState<SupabaseHealth | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [appResponse, databaseResponse] = await Promise.all([
          fetch("/api/health", { cache: "no-store" }),
          fetch("/api/health/supabase", { cache: "no-store" }),
        ]);

        if (!appResponse.ok) {
          throw new Error(`App health returned ${appResponse.status}.`);
        }

        const appData = (await appResponse.json()) as AppHealth;
        const databaseData = (await databaseResponse.json()) as SupabaseHealth;

        if (!cancelled) {
          setApp(appData);
          setDatabase(databaseData);
        }
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Unable to load health checks.");
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      {error ? (
        <div
          role="alert"
          className="edge-lit mb-3 rounded-xl border border-[#f43f5e]/25 bg-[#f43f5e]/[0.07] px-4 py-3 shadow-[0_0_45px_-20px_rgba(244,63,94,0.5)] backdrop-blur-xl"
        >
          <div className="flex items-start gap-3">
            <TriangleAlert
              aria-hidden="true"
              className="mt-0.5 h-4 w-4 shrink-0 text-[#fb7185]"
              strokeWidth={1.7}
            />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-[#fda4af]">
                Error: health check failed
              </p>
              <p className="mt-1 font-sans text-[14px] leading-5 text-ink">{error}</p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="divide-y divide-white/[0.06] overflow-hidden rounded-xl border border-white/10 bg-black/25">
        <StatusRow
          label="Next.js app"
          state={app ? "ok" : error ? "error" : "loading"}
          detail={
            app
              ? `Service ${app.service} responded at ${new Date(app.timestamp).toLocaleTimeString()}.`
              : error
                ? "The app health endpoint did not respond."
                : "Checking the app health endpoint..."
          }
        />

        <StatusRow
          label="Supabase connection"
          state={
            !database
              ? error
                ? "error"
                : "loading"
              : database.status === "connected"
                ? "ok"
                : database.status === "not_configured"
                  ? "warn"
                  : "error"
          }
          detail={
            database
              ? database.status === "connected"
                ? `Connected in ${database.latencyMs ?? 0} ms.`
                : database.message || database.status
              : error
                ? "The Supabase health endpoint did not respond."
                : "Checking the Supabase Auth endpoint."
          }
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] text-ink-secondary">
        <a className="transition-colors hover:text-ink" href="/api/health">
          /api/health
        </a>
        <a className="transition-colors hover:text-ink" href="/api/health/supabase">
          /api/health/supabase
        </a>
      </div>
    </div>
  );
}
