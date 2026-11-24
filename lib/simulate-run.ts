import { TEST_CATALOG } from "./test-catalog";
import type { LiveStep, RunRecord, TestResult } from "./run-types";

/** Step delay — keeps the suite long enough for a client demo. */
const STEP_MS = 850;

/**
 * Logs mirror the real Goalprize Admin web flow:
 * login → POST auth/admin/login → 2fa-setup → /dashboard/statistics
 */
const STEP_SCRIPTS: Record<string, string[]> = {
  "admin-login-page": [
    "› admin/login.spec.ts › Login — admin sign-in page loads",
    "  navigate  https://admin-staging.goalprize.com/",
    "  wait for  Angular bootstrap / login route",
    "  assert    redirect '' → /login",
    "  expect    heading \"GoalPrize Admin\"",
    "  expect    text \"Enter your email and password to sign in\"",
    "  expect    input[placeholder=Email] visible",
    "  expect    input[placeholder=Password] visible",
    "  expect    button \"Sign in\" visible",
    "  expect    button \"forgot password?\" visible",
    "  expect    brand logo assets/img/logo-ct.png rendered",
    "  ✓ Login — admin sign-in page loads (9.4s)",
  ],
  "admin-login-validation": [
    "› admin/login.spec.ts › Login — required fields validation",
    "  navigate  https://admin-staging.goalprize.com/login",
    "  click     button \"Sign in\" (email empty, password empty)",
    "  intercept login() client guard — no API call when fields empty",
    "  expect    role=alert visible",
    "  expect    alert text \"Please fill up all required fields\"",
    "  expect    still on /login (no navigation)",
    "  ✓ Login — required fields validation (6.8s)",
  ],
  "admin-login-success": [
    "› admin/login.spec.ts › Login — valid admin credentials",
    "  navigate  https://admin-staging.goalprize.com/login",
    "  fill      Email",
    "  fill      Password",
    "  click     button \"Sign in\"",
    "  network   POST https://api-staging.goalprize.com/api/v1/auth/admin/login",
    "  wait for  200 response · data.response.token",
    "  storage   localStorage auth-token written",
    "  navigate  /2fa-setup?email=…&token=…&isTwoFactorEnabled=…",
    "  expect    URL matches /2fa-setup",
    "  expect    2FA setup screen rendered",
    "  ✓ Login — valid admin credentials (12.1s)",
  ],
  "admin-dashboard-core": [
    "› admin/core.spec.ts › Core — statistics dashboard loads",
    "  navigate  /dashboard/statistics (authenticated)",
    "  wait for  dashboard layout shell",
    "  expect    sidebar navigation mounted",
    "  expect    heading \"Statistics\"",
    "  expect    period controls Today / Weekly / Monthly",
    "  network   statistics metrics requested for selected period",
    "  expect    statistics cards / charts region visible",
    "  expect    no redirect back to /login",
    "  ✓ Core — statistics dashboard loads (10.6s)",
  ],
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type SimulateHandlers = {
  onUpdate: (run: RunRecord) => void;
};

export async function simulateSuiteRun(
  handlers: SimulateHandlers,
): Promise<RunRecord> {
  const startedAt = new Date().toISOString();
  const steps: LiveStep[] = [
    {
      at: startedAt,
      message: `Running ${TEST_CATALOG.length} checks · Goalprize Admin · admin-staging`,
    },
    {
      at: startedAt,
      message: "Target  https://admin-staging.goalprize.com",
    },
    {
      at: startedAt,
      message: "API     https://api-staging.goalprize.com/api/v1/",
    },
  ];
  const finishedTests: TestResult[] = [];
  const checkStartedAt = new Map<string, number>();

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
  await sleep(STEP_MS);

  for (const catalog of TEST_CATALOG) {
    checkStartedAt.set(catalog.id, Date.now());
    run = { ...run, tests: buildTests(catalog.id), steps: [...steps] };
    handlers.onUpdate(run);

    const script = STEP_SCRIPTS[catalog.id] ?? [
      `› ${catalog.title}`,
      `  ✓ ${catalog.title}`,
    ];

    for (const line of script) {
      await sleep(STEP_MS);
      steps.push({ at: new Date().toISOString(), message: line });
      run = { ...run, steps: [...steps], tests: buildTests(catalog.id) };
      handlers.onUpdate(run);
    }

    const started = checkStartedAt.get(catalog.id) ?? Date.now();
    finishedTests.push({
      id: catalog.id,
      title: catalog.title,
      file: catalog.file,
      status: "passed",
      durationMs: Date.now() - started,
    });
  }

  const finishedAt = new Date().toISOString();
  const durationMs =
    new Date(finishedAt).getTime() - new Date(startedAt).getTime();
  await sleep(STEP_MS);
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
