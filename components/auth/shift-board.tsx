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
  idle: "bg-[#F1EBDD]/40",
  ok: "bg-[#FFFAF0]",
  warn: "bg-[#FFE0A8]",
  error: "bg-[#2B0703]",
};

const TONE_WORD: Record<Tone, string> = {
  idle: "Checking",
  ok: "Ready",
  warn: "Not configured",
  error: "Down",
};

function Cell({ label, tone, value, detail }: { label: string; tone: Tone; value: string; detail: string }) {
  return (
    <div>
      <dt className="font-sans text-[13px] text-onAccent/80">{label}</dt>
      <dd className="mt-1 flex items-baseline gap-2">
        <span className={`h-2 w-2 shrink-0 ${TONE_MARK[tone]}`} aria-hidden="true" />
        <span className="display text-[20px] text-onAccent">{TONE_WORD[tone]}</span>
      </dd>
      <dd className="figure mt-0.5 text-[13px] text-onAccent/80">
        {value} <span className="font-serif">{detail}</span>
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
      className="bg-accent px-5 py-5 text-onAccent sm:px-8"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="counter-board" className="font-sans text-[13px] font-semibold">
          Counter board
        </h2>
        <p className="font-sans text-[13px] text-onAccent/80">Read on load</p>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4">
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
        <p className="mt-4 font-serif text-[13px] leading-5 text-onAccent/85">
          The health checks did not answer. Open system status before the first customer.
        </p>
      ) : null}
    </section>
  );
}
