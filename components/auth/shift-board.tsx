"use client";

import { useEffect, useState } from "react";

type AppHealth = { status: string; service: string; timestamp: string };
type SupabaseHealth = {
  status: "connected" | "not_configured" | "unavailable";
  latencyMs?: number;
  message?: string;
};

type Tone = "idle" | "ok" | "warn" | "error";

const TONE_MARK: Record<Tone, string> = {
  idle: "bg-ink-faint",
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

function Cell({
  label,
  tone,
  value,
  detail,
}: {
  label: string;
  tone: Tone;
  value: string;
  detail: string;
}) {
  return (
    <div>
      <dt className="font-sans text-[12px] text-ink-tertiary">{label}</dt>
      <dd className="mt-1 flex items-baseline gap-2">
        <span className={`h-1.5 w-1.5 shrink-0 ${TONE_MARK[tone]}`} aria-hidden="true" />
        <span className="font-sans text-[14px] font-medium text-ink">{TONE_WORD[tone]}</span>
      </dd>
      <dd className="mt-0.5 font-sans text-[12px] text-ink-tertiary">
        <span className="figure text-ink-secondary">{value}</span> {detail}
      </dd>
    </div>
  );
}

/**
 * The counter board: the one live element on this screen, reading the same two
 * health endpoints as /status. Nothing on it is invented.
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
    <section
      aria-labelledby="counter-board"
      className="rounded-sm bg-sunken px-4 py-3.5 ring-1 ring-inset ring-white/[0.06]"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2
          id="counter-board"
          className="font-mono text-2xs uppercase tracking-[0.16em] text-ink-tertiary"
        >
          Counter board
        </h2>
        <p className="font-mono text-2xs uppercase tracking-[0.16em] text-ink-faint">Live</p>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3">
        <Cell
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
          detail={failed ? "no answer" : "response"}
        />
        <Cell
          label="Records"
          tone={dbTone}
          value={database?.latencyMs !== undefined ? `${database.latencyMs}` : "—"}
          detail={database?.latencyMs !== undefined ? "ms round trip" : "no answer"}
        />
      </dl>

      {failed ? (
        <p className="mt-3 border-t border-hairline pt-3 font-sans text-[12px] leading-5 text-negative-ink">
          The health checks did not answer. Open system status before the first customer.
        </p>
      ) : null}
    </section>
  );
}
