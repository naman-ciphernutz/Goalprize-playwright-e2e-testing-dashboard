"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { RunRecord, TestResult } from "@/lib/run-types";
import { createIdleRun } from "@/lib/run-types";
import { TEST_CATALOG, type CatalogTest } from "@/lib/test-catalog";
import { simulateSuiteRun } from "@/lib/simulate-run";

type Tab = "overview" | "runs" | "tests";

const STORAGE_KEY = "gp-admin-last-run";

function formatTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function statusBadge(status: RunRecord["status"]) {
  if (status === "passed") {
    return "border-[var(--qa-pass)]/30 bg-[var(--qa-pass)]/10 text-[var(--qa-pass)]";
  }
  if (status === "failed") {
    return "border-[var(--qa-fail)]/30 bg-[var(--qa-fail)]/10 text-[var(--qa-fail)]";
  }
  if (status === "running") {
    return "border-[var(--qa-run)]/30 bg-[var(--qa-run)]/10 text-[var(--qa-run)]";
  }
  return "border-[var(--qa-border)] bg-[var(--qa-panel-2)] text-[var(--qa-muted)]";
}

function resultStatusClass(status: TestResult["status"]) {
  if (status === "passed") return "text-[var(--qa-pass)]";
  if (status === "failed") return "text-[var(--qa-fail)]";
  if (status === "running") return "text-[var(--qa-run)]";
  return "text-[var(--qa-muted)]";
}

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [run, setRun] = useState<RunRecord>(() => createIdleRun());
  const [busy, setBusy] = useState(false);
  const catalog: CatalogTest[] = TEST_CATALOG;
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      setRun(JSON.parse(raw) as RunRecord);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (run.status === "idle" || run.status === "running") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(run));
    } catch {
      // ignore
    }
  }, [run]);

  useEffect(() => {
    if (!logRef.current) return;
    logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [run.steps]);

  const passedCount = useMemo(
    () => run.tests.filter((t) => t.status === "passed").length,
    [run.tests],
  );
  const failedCount = useMemo(
    () => run.tests.filter((t) => t.status === "failed").length,
    [run.tests],
  );
  const runningCount = useMemo(
    () => run.tests.filter((t) => t.status === "running").length,
    [run.tests],
  );
  const totalTests = catalog.length;
  const progressPct =
    run.status === "idle"
      ? 0
      : run.status === "passed" || run.status === "failed"
        ? 100
        : Math.min(
            95,
            Math.round(((passedCount + runningCount * 0.35) / totalTests) * 100),
          );

  async function onRun() {
    if (busy || run.status === "running") return;
    setBusy(true);
    setTab("runs");
    try {
      await fetch("/api/run-tests", { method: "POST" });
      await simulateSuiteRun({
        onUpdate: (next) => setRun(next),
      });
    } finally {
      setBusy(false);
    }
  }

  const rows: TestResult[] =
    run.tests.length > 0
      ? run.tests
      : catalog.map((t) => ({
          id: t.id,
          title: t.title,
          file: t.file,
          status: "skipped",
          durationMs: 0,
        }));

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--qa-muted)]">
            Project
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--qa-text)]">
            Goalprize Admin
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--qa-muted)]">
            Login and core flows against admin-staging.goalprize.com — auth,
            2FA handoff, and statistics.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void onRun()}
          disabled={busy || run.status === "running"}
          className="inline-flex items-center gap-2 rounded-md bg-[var(--qa-accent)] px-5 py-2.5 text-sm font-semibold text-[#041018] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-55"
        >
          {busy || run.status === "running" ? (
            <>
              <span className="qa-pulse h-2 w-2 rounded-full bg-[#041018]" />
              Running suite…
            </>
          ) : (
            <>Run suite</>
          )}
        </button>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Environment", value: "Staging" },
          {
            label: "Status",
            value:
              run.status === "idle"
                ? "Ready"
                : run.status === "running"
                  ? "In progress"
                  : run.status === "passed"
                    ? "Healthy"
                    : "Attention",
            tone:
              run.status === "passed"
                ? "text-[var(--qa-pass)]"
                : run.status === "failed"
                  ? "text-[var(--qa-fail)]"
                  : run.status === "running"
                    ? "text-[var(--qa-run)]"
                    : "",
          },
          {
            label: "Pass rate",
            value:
              run.status === "passed"
                ? "100%"
                : run.status === "failed"
                  ? `${Math.round((passedCount / totalTests) * 100)}%`
                  : "—",
          },
          {
            label: "Last completed",
            value:
              run.finishedAt != null
                ? new Date(run.finishedAt).toLocaleTimeString()
                : "—",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[var(--qa-border)] bg-[var(--qa-panel)]/90 px-4 py-4"
          >
            <p className="text-xs text-[var(--qa-muted)]">{stat.label}</p>
            <p className={`mt-2 text-xl font-semibold ${stat.tone ?? ""}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      {(run.status === "running" || progressPct > 0) && (
        <section className="rounded-xl border border-[var(--qa-border)] bg-[var(--qa-panel)] px-4 py-3">
          <div className="mb-2 flex items-center justify-between text-xs text-[var(--qa-muted)]">
            <span>
              Suite progress · {passedCount}/{totalTests} completed
              {runningCount ? " · 1 active" : ""}
            </span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--qa-panel-2)]">
            <div
              className="h-full rounded-full bg-[var(--qa-accent)] transition-[width] duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </section>
      )}

      <div className="flex gap-1 border-b border-[var(--qa-border)]">
        {(
          [
            ["overview", "Overview"],
            ["runs", "Runs"],
            ["tests", "Checks"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm transition ${
              tab === id
                ? "border-[var(--qa-accent)] text-[var(--qa-text)]"
                : "border-transparent text-[var(--qa-muted)] hover:text-[var(--qa-text)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <section className="overflow-hidden rounded-xl border border-[var(--qa-border)] bg-[var(--qa-panel)]">
          <div className="flex items-center justify-between border-b border-[var(--qa-border)] px-5 py-3">
            <h2 className="text-sm font-medium">Project health</h2>
            <span
              className={`rounded-md border px-2 py-0.5 text-xs capitalize ${statusBadge(run.status)}`}
            >
              {run.status === "idle" ? "idle" : run.status}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-[11px] uppercase tracking-[0.08em] text-[var(--qa-muted)]">
                <tr className="border-b border-[var(--qa-border)]">
                  <th className="px-5 py-3 font-medium">Project</th>
                  <th className="px-5 py-3 font-medium">History</th>
                  <th className="px-5 py-3 font-medium">Tendency</th>
                  <th className="px-5 py-3 font-medium">Pass rate</th>
                  <th className="px-5 py-3 font-medium">Latest</th>
                  <th className="px-5 py-3 font-medium">Checks</th>
                </tr>
              </thead>
              <tbody>
                <tr className="align-top">
                  <td className="px-5 py-4">
                    <p className="font-medium text-[var(--qa-link)]">
                      Goalprize Admin
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="rounded bg-[#0c4a6e]/40 px-1.5 py-0.5 text-[10px] text-sky-300">
                        smoke
                      </span>
                      <span className="rounded bg-[#4c0519]/35 px-1.5 py-0.5 text-[10px] text-rose-300">
                        critical
                      </span>
                      <span className="rounded bg-[#052e16]/40 px-1.5 py-0.5 text-[10px] text-emerald-300">
                        staging
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex h-9 items-end gap-[3px]">
                      {Array.from({ length: 16 }).map((_, i) => {
                        const active = run.status !== "idle" && i === 15;
                        const color = active
                          ? run.status === "failed"
                            ? "bg-[var(--qa-fail)]"
                            : run.status === "running"
                              ? "bg-[var(--qa-run)]"
                              : "bg-[var(--qa-pass)]"
                          : "bg-[var(--qa-border)]";
                        return (
                          <span
                            key={i}
                            className={`w-1.5 rounded-sm ${color}`}
                            style={{
                              height: active
                                ? "100%"
                                : `${28 + ((i * 7) % 45)}%`,
                            }}
                          />
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-md border px-2 py-0.5 text-xs ${statusBadge(run.status === "idle" ? "idle" : run.status)}`}
                    >
                      {run.status === "idle"
                        ? "No runs"
                        : run.status === "passed"
                          ? "Passing"
                          : run.status === "failed"
                            ? "Failing"
                            : "Running"}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-medium text-[var(--qa-pass)]">
                    {run.status === "passed"
                      ? "100%"
                      : run.status === "failed"
                        ? "0%"
                        : "—"}
                  </td>
                  <td className="px-5 py-4">
                    <p className="capitalize">{run.status === "idle" ? "—" : run.status}</p>
                    <p className="mt-1 text-xs text-[var(--qa-muted)]">
                      {formatTime(run.finishedAt ?? run.startedAt)}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-[var(--qa-muted)]">
                    {passedCount}/{totalTests}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === "runs" ? (
        <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-xl border border-[var(--qa-border)] bg-[var(--qa-panel)]">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--qa-border)] px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold">Latest run</h2>
                  <span
                    className={`rounded-md border px-2 py-0.5 text-xs capitalize ${statusBadge(run.status)}`}
                  >
                    {run.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[var(--qa-muted)]">
                  admin-staging · Chromium · 1 worker
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-md border border-[var(--qa-border)] px-2.5 py-1 text-[var(--qa-pass)]">
                  {passedCount} passed
                </span>
                <span className="rounded-md border border-[var(--qa-border)] px-2.5 py-1 text-[var(--qa-fail)]">
                  {failedCount} failed
                </span>
                <span className="rounded-md border border-[var(--qa-border)] px-2.5 py-1 text-[var(--qa-muted)]">
                  {totalTests} total
                </span>
              </div>
            </div>

            <div className="divide-y divide-[var(--qa-border)]">
              {rows.map((t) => (
                <div
                  key={t.id}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-5 py-3.5 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{t.title}</p>
                    <p className="mt-0.5 truncate text-xs text-[var(--qa-muted)]">
                      {t.file}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium uppercase tracking-wide ${resultStatusClass(t.status)}`}
                  >
                    {t.status === "skipped" ? "queued" : t.status}
                  </span>
                  <span className="w-14 text-right text-xs text-[var(--qa-muted)]">
                    {t.durationMs
                      ? `${(t.durationMs / 1000).toFixed(1)}s`
                      : "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex h-[min(520px,70vh)] flex-col overflow-hidden rounded-xl border border-[var(--qa-border)] bg-[#080b10]">
            <div className="flex shrink-0 items-center justify-between border-b border-[var(--qa-border)] px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--qa-muted)]">
                Execution log
              </p>
              {run.status === "running" ? (
                <span className="qa-pulse text-xs text-[var(--qa-run)]">
                  live
                </span>
              ) : null}
            </div>
            <div
              ref={logRef}
              className="qa-scroll min-h-0 flex-1 space-y-1 overflow-y-auto px-4 py-3 font-mono text-[12px] leading-5 text-[#b7c2d2]"
            >
              {run.steps.length === 0 ? (
                <p className="text-[var(--qa-muted)]">
                  Click Run suite to stream the Goalprize Admin login and
                  statistics flow.
                </p>
              ) : (
                run.steps.map((step, index) => (
                  <p
                    key={`${step.at}-${index}`}
                    className={
                      step.message.includes("✓")
                        ? "text-[var(--qa-pass)]"
                        : step.message.startsWith("›")
                          ? "pt-2 text-[var(--qa-link)]"
                          : step.message.startsWith("  network")
                            ? "text-sky-300/90"
                            : ""
                    }
                  >
                    <span className="mr-2 text-[var(--qa-muted)]">
                      {new Date(step.at).toLocaleTimeString()}
                    </span>
                    {step.message}
                  </p>
                ))
              )}
            </div>
          </div>
        </section>
      ) : null}

      {tab === "tests" ? (
        <section className="overflow-hidden rounded-xl border border-[var(--qa-border)] bg-[var(--qa-panel)]">
          <div className="border-b border-[var(--qa-border)] px-5 py-3 text-sm text-[var(--qa-muted)]">
            Checks covering admin login and statistics
          </div>
          <ul className="divide-y divide-[var(--qa-border)]">
            {catalog.map((t, index) => (
              <li
                key={t.id}
                className="flex flex-wrap items-start justify-between gap-4 px-5 py-4"
              >
                <div className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--qa-panel-2)] text-xs text-[var(--qa-muted)]">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-[var(--qa-text)]">{t.title}</p>
                    <p className="mt-1 max-w-2xl text-sm text-[var(--qa-muted)]">
                      {t.description}
                    </p>
                    <p className="mt-2 text-xs text-[var(--qa-muted)]">{t.file}</p>
                  </div>
                </div>
                <span className="rounded-md border border-[var(--qa-border)] px-2 py-1 text-xs text-[var(--qa-muted)]">
                  browser
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
