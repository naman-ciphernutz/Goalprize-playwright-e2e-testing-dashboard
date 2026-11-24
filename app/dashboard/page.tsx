"use client";

import { useEffect, useMemo, useState } from "react";
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
    return "border-[var(--qa-pass)]/40 bg-[var(--qa-pass)]/10 text-[var(--qa-pass)]";
  }
  if (status === "failed") {
    return "border-[var(--qa-fail)]/40 bg-[var(--qa-fail)]/10 text-[var(--qa-fail)]";
  }
  if (status === "running") {
    return "border-[var(--qa-run)]/40 bg-[var(--qa-run)]/10 text-[var(--qa-run)]";
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

  const passedCount = useMemo(
    () => run.tests.filter((t) => t.status === "passed").length,
    [run.tests],
  );
  const failedCount = useMemo(
    () => run.tests.filter((t) => t.status === "failed").length,
    [run.tests],
  );
  const totalTests = catalog.length;

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
    <div className="p-4 md:p-6">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--qa-muted)]">
            Project
          </p>
          <h1 className="text-2xl font-semibold text-[var(--qa-link)]">
            Goalprize Admin
          </h1>
          <p className="mt-1 text-sm text-[var(--qa-muted)]">
            Playwright · admin-staging.goalprize.com · login + core
          </p>
        </div>
        <button
          type="button"
          onClick={() => void onRun()}
          disabled={busy || run.status === "running"}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--qa-run)] px-4 py-2.5 text-sm font-semibold text-[#1a1205] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span aria-hidden>◉</span>
          {busy || run.status === "running" ? "Running…" : "Run tests"}
        </button>
      </header>

      <div className="mb-5 grid gap-3 sm:grid-cols-4">
        {[
          { label: "projects", value: "1" },
          {
            label: "failing now",
            value: String(run.status === "failed" ? 1 : 0),
            tone: run.status === "failed" ? "text-[var(--qa-fail)]" : "",
          },
          {
            label: "pass rate",
            value:
              run.status === "passed"
                ? "100%"
                : run.status === "failed"
                  ? "0%"
                  : "—",
          },
          {
            label: "last run",
            value:
              run.status === "idle"
                ? "none"
                : run.status === "running"
                  ? "live"
                  : run.status,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[var(--qa-border)] bg-[var(--qa-panel)] px-4 py-3"
          >
            <p className="text-xs text-[var(--qa-muted)]">{stat.label}</p>
            <p className={`mt-1 text-xl font-semibold ${stat.tone ?? ""}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex gap-1 border-b border-[var(--qa-border)]">
        {(
          [
            ["overview", "Overview"],
            ["runs", "Runs"],
            ["tests", "Tests"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`border-b-2 px-4 py-2 text-sm transition ${
              tab === id
                ? "border-[var(--qa-link)] text-[var(--qa-text)]"
                : "border-transparent text-[var(--qa-muted)] hover:text-[var(--qa-text)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <section className="rounded-xl border border-[var(--qa-border)] bg-[var(--qa-panel)]">
          <div className="border-b border-[var(--qa-border)] px-4 py-3 text-sm font-medium">
            Project health
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-[var(--qa-muted)]">
                <tr className="border-b border-[var(--qa-border)]">
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Last runs</th>
                  <th className="px-4 py-3 font-medium">Tendency</th>
                  <th className="px-4 py-3 font-medium">Pass rate</th>
                  <th className="px-4 py-3 font-medium">Latest run</th>
                  <th className="px-4 py-3 font-medium">Tests</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-4">
                    <p className="font-medium text-[var(--qa-link)]">
                      Goalprize Admin
                    </p>
                    <div className="mt-1 flex gap-1">
                      <span className="rounded bg-[#1e3a5f] px-1.5 py-0.5 text-[10px] text-[#7dd3fc]">
                        smoke
                      </span>
                      <span className="rounded bg-[#3f1d2e] px-1.5 py-0.5 text-[10px] text-[#fda4af]">
                        critical
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex h-8 items-end gap-0.5">
                      {Array.from({ length: 12 }).map((_, i) => {
                        const filled = run.status !== "idle" && i === 11;
                        const color =
                          run.status === "failed"
                            ? "bg-[var(--qa-fail)]"
                            : run.status === "passed"
                              ? "bg-[var(--qa-pass)]"
                              : run.status === "running" && i === 11
                                ? "bg-[var(--qa-run)]"
                                : "bg-[var(--qa-border)]";
                        return (
                          <span
                            key={i}
                            className={`w-1.5 rounded-sm ${color}`}
                            style={{
                              height: filled ? "100%" : `${30 + (i % 5) * 10}%`,
                            }}
                          />
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-4">
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
                  <td className="px-4 py-4 text-[var(--qa-pass)]">
                    {run.status === "passed"
                      ? "100%"
                      : run.status === "failed"
                        ? "0%"
                        : "—"}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-flex w-fit rounded-md border px-2 py-0.5 text-xs capitalize ${statusBadge(run.status)}`}
                      >
                        {run.status === "idle" ? "Idle" : run.status}
                      </span>
                      <span className="text-xs text-[var(--qa-muted)]">
                        {formatTime(run.finishedAt ?? run.startedAt)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[var(--qa-muted)]">
                    {passedCount}/{totalTests}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === "runs" ? (
        <section className="space-y-4">
          <div className="rounded-xl border border-[var(--qa-border)] bg-[var(--qa-panel)] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">Latest run</h2>
                  <span
                    className={`rounded-md border px-2 py-0.5 text-xs capitalize ${statusBadge(run.status)}`}
                  >
                    {run.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[var(--qa-muted)]">
                  Goalprize Admin · chromium · admin-staging
                </p>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="rounded-md border border-[var(--qa-border)] px-2 py-1 text-[var(--qa-pass)]">
                  {passedCount} passed
                </span>
                <span className="rounded-md border border-[var(--qa-border)] px-2 py-1 text-[var(--qa-fail)]">
                  {failedCount} failed
                </span>
                <span className="rounded-md border border-[var(--qa-border)] px-2 py-1 text-[var(--qa-muted)]">
                  {totalTests} total
                </span>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-lg border border-[var(--qa-border)]">
              <div className="grid grid-cols-[1fr_auto_auto] gap-3 bg-[var(--qa-panel-2)] px-4 py-2 text-xs uppercase tracking-wide text-[var(--qa-muted)]">
                <span>Test</span>
                <span>Status</span>
                <span>Duration</span>
              </div>
              {rows.map((t) => (
                <div
                  key={t.id}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-t border-[var(--qa-border)] px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{t.title}</p>
                    <p className="text-xs text-[var(--qa-muted)]">
                      {t.file ?? "tests/admin/login.spec.ts"}
                    </p>
                  </div>
                  <span className={resultStatusClass(t.status)}>
                    {t.status === "skipped" ? "—" : t.status}
                  </span>
                  <span className="text-[var(--qa-muted)]">
                    {t.durationMs ? `${(t.durationMs / 1000).toFixed(1)}s` : "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--qa-border)] bg-[#0e1116] p-4">
            <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--qa-muted)]">
              Live progress
            </p>
            <div className="max-h-48 space-y-1 overflow-y-auto font-mono text-[12px] leading-5 text-[#c5cbd6]">
              {run.steps.length === 0 ? (
                <p className="text-[var(--qa-muted)]">
                  Click “Run tests” — progress lines appear here while the suite
                  executes.
                </p>
              ) : (
                run.steps.map((step) => (
                  <p key={`${step.at}-${step.message}`}>
                    <span className="text-[var(--qa-muted)]">
                      {new Date(step.at).toLocaleTimeString()}{" "}
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
        <section className="rounded-xl border border-[var(--qa-border)] bg-[var(--qa-panel)]">
          <div className="border-b border-[var(--qa-border)] px-4 py-3 text-sm text-[var(--qa-muted)]">
            Test cases · file order
          </div>
          <ul>
            {catalog.map((t) => (
              <li
                key={t.id}
                className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--qa-border)] px-4 py-4"
              >
                <div>
                  <p className="font-medium text-[var(--qa-link)]">{t.title}</p>
                  <p className="mt-1 text-sm text-[var(--qa-muted)]">
                    {t.description}
                  </p>
                  <p className="mt-1 text-xs text-[var(--qa-muted)]">{t.file}</p>
                </div>
                <span className="rounded-md border border-[var(--qa-border)] px-2 py-1 text-xs text-[var(--qa-muted)]">
                  chromium
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
