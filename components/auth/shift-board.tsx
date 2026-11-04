"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type AppHealth = { status: string; service: string; timestamp: string };
type SupabaseHealth = {
  status: "connected" | "not_configured" | "unavailable";
  latencyMs?: number;
  message?: string;
};

type Tone = "idle" | "ok" | "warn" | "error";

const TONE_DOT: Record<Tone, string> = {
  idle: "bg-muted/50",
  ok: "bg-positive",
  warn: "bg-warn",
  error: "bg-negative",
};

const TONE_WORD: Record<Tone, string> = {
  idle: "Checking",
  ok: "Ready",
  warn: "Not configured",
  error: "Down",
};

function Row({ label, tone, value }: { label: string; tone: Tone; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 px-3 py-2.5">
      <dt className="text-[13px] text-muted">{label}</dt>
      <dd className="flex items-baseline gap-3">
        <span className="flex items-center gap-1.5 text-[13px] text-ink">
          <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", TONE_DOT[tone])} aria-hidden="true" />
          {TONE_WORD[tone]}
        </span>
        <span className="figure w-[3.6rem] text-right text-[13px] text-muted">{value}</span>
      </dd>
    </div>
  );
}

/**
 * The counter board: the one live element on this screen, reading the same two
 * health endpoints the /status page uses. Nothing on it is invented.
 */
export function ShiftBoard() {
  const [app, setApp] = useState<AppHealth | null>(null);
  const [database, setDatabase] = useState<SupabaseHealth | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [appResponse, databaseResponse] = await Promise.all([
          fetch("/api/health", { cache: "no-store" }),
          fetch("/api/health/supabase", { cache: "no-store" }),
        ]);
        if (!appResponse.ok) throw new Error("health");

        const appData = (await appResponse.json()) as AppHealth;
        const databaseData = (await databaseResponse.json()) as SupabaseHealth;

        if (!cancelled) {
          setApp(appData);
          setDatabase(databaseData);
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const appTone: Tone = failed ? "error" : app ? "ok" : "idle";
  const dbTone: Tone = failed
    ? "error"
    : !database
      ? "idle"
      : database.status === "connected"
        ? "ok"
        : database.status === "not_configured"
          ? "warn"
          : "error";

  return (
    <section aria-labelledby="counter-board" className="max-w-[26rem]">
      <h2 id="counter-board" className="text-[13px] font-medium text-ink">
        Counter board
      </h2>
      <div className="mt-2 rounded-sm bg-surface">
        <dl>
          <Row
            label="Desk app"
            tone={appTone}
            value={
              app
                ? new Date(app.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"
            }
          />
          <Row
            label="Records"
            tone={dbTone}
            value={database?.latencyMs !== undefined ? `${database.latencyMs} ms` : "—"}
          />
        </dl>
      </div>
      <p className="mt-2 text-[12px] leading-5 text-muted">
        {failed
          ? "Health endpoints did not answer. Check system status."
          : "Read from the health endpoints when this page loads."}
      </p>
    </section>
  );
}
