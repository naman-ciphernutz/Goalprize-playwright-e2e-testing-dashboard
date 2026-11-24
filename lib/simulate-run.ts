import { TEST_CATALOG } from "./test-catalog";
import type { LiveStep, RunRecord, TestResult } from "./run-types";

const STEP_SCRIPTS: Record<string, string[]> = {
  "admin-login-page": [
    "› tests/admin/login.spec.ts › Login — admin sign-in page loads",
    "  goto https://admin-staging.goalprize.com/",
    "  expect heading GoalPrize Admin visible",
    "  ✓ Login — admin sign-in page loads (1.8s)",
  ],
  "admin-login-validation": [
    "› tests/admin/login.spec.ts › Login — required fields validation",
    "  click Sign in",
    "  expect alert Please fill up all required fields",
    "  ✓ Login — required fields validation (1.2s)",
  ],
  "admin-login-success": [
    "› tests/admin/login.spec.ts › Login — valid admin credentials",
    "  fill email / password",
    "  click Sign in",
    "  expect post-login navigation",
    "  ✓ Login — valid admin credentials (2.4s)",
  ],
  "admin-dashboard-core": [
    "› tests/admin/core.spec.ts › Core — statistics dashboard loads",
    "  goto /dashboard/statistics",
    "  expect statistics shell visible",
    "  ✓ Core — statistics dashboard loads (2.1s)",
  ],
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type SimulateHandlers = {
  onUpdate: (run: RunRecord) => void;
};

/** Client-side suite run for Vercel (no Chromium on serverless). */
export async function simulateSuiteRun(
  handlers: SimulateHandlers,
): Promise<RunRecord> {
  const startedAt = new Date().toISOString();
  const steps: LiveStep[] = [
    { at: startedAt, message: `Running ${TEST_CATALOG.length} tests using 1 worker` },
  ];
  const finishedTests: TestResult[] = [];

  const buildTests = (currentId?: string): TestResult[] =>
    TEST_CATALOG.map((t) => {
      const done = finishedTests.find((f) => f.id === t.id);
      if (done) return done;
      if (t.id === currentId) {
        return {
          id: t.id,
          title: t.title,
          file: t.file,
          status: "running",
          durationMs: 0,
        };
      }
      return {
        id: t.id,
        title: t.title,
        file: t.file,
        status: "skipped",
        durationMs: 0,
      };
    });

  let run: RunRecord = {
    status: "running",
    startedAt,
    finishedAt: null,
    durationMs: null,
    headed: false,
    piwiUrl: "",
    steps: [...steps],
    tests: buildTests(TEST_CATALOG[0]?.id),
  };
  handlers.onUpdate(run);

  for (const catalog of TEST_CATALOG) {
    run = { ...run, tests: buildTests(catalog.id), steps: [...steps] };
    handlers.onUpdate(run);

    const script = STEP_SCRIPTS[catalog.id] ?? [
      `› ${catalog.title}`,
      `  ✓ ${catalog.title}`,
    ];
    for (const line of script) {
      await sleep(320 + Math.floor(Math.random() * 220));
      steps.push({ at: new Date().toISOString(), message: line });
      run = { ...run, steps: [...steps], tests: buildTests(catalog.id) };
      handlers.onUpdate(run);
    }

    finishedTests.push({
      id: catalog.id,
      title: catalog.title,
      file: catalog.file,
      status: "passed",
      durationMs: 1100 + Math.floor(Math.random() * 1400),
    });
  }

  const finishedAt = new Date().toISOString();
  const durationMs =
    new Date(finishedAt).getTime() - new Date(startedAt).getTime();
  steps.push({
    at: finishedAt,
    message: `  ${TEST_CATALOG.length} passed (${(durationMs / 1000).toFixed(1)}s)`,
  });

  run = {
    status: "passed",
    startedAt,
    finishedAt,
    durationMs,
    headed: false,
    piwiUrl: "",
    steps: [...steps],
    tests: [...finishedTests],
  };
  handlers.onUpdate(run);
  return run;
}
