import { NextResponse } from "next/server";
import { TEST_CATALOG } from "@/lib/test-catalog";
import { createIdleRun } from "@/lib/run-types";

/**
 * Vercel-safe endpoint: starts a suite run in the client.
 * Chromium cannot run on Vercel serverless; the dashboard executes the run UX.
 */
export async function POST() {
  const startedAt = new Date().toISOString();
  const run = {
    ...createIdleRun(),
    status: "running" as const,
    startedAt,
    finishedAt: null,
    durationMs: null,
    headed: false,
    steps: [
      {
        at: startedAt,
        message: `Running ${TEST_CATALOG.length} tests using 1 worker`,
      },
    ],
    tests: TEST_CATALOG.map((t) => ({
      id: t.id,
      title: t.title,
      file: t.file,
      status: "running" as const,
      durationMs: 0,
    })),
  };

  return NextResponse.json({
    ok: true,
    run,
    mode: "dashboard",
  });
}
