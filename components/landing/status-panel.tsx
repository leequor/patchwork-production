"use client";

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
  loading: "text-muted",
  ok: "text-positive",
  warn: "text-warn",
  error: "text-negative",
} as const;

const DOT = {
  loading: "bg-[#5a6b62]",
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
        <p className="mt-0.5 max-w-[58ch] font-serif text-[15px] leading-6 text-muted">{detail}</p>
      </div>
      <span className={cn("inline-flex shrink-0 items-center gap-1.5 text-[13px] font-medium", TONE[state])}>
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
        <div className="mb-3 rounded-sm bg-negative-soft px-3.5 py-3 text-[14px] leading-5 text-negative-ink">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded bg-paper">
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

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-sans text-[13px] text-muted">
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
