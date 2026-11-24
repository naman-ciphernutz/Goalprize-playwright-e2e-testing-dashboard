import { TEST_CATALOG } from "./test-catalog";

export type TestStatus = "idle" | "running" | "passed" | "failed";

export type LiveStep = {
  at: string;
  message: string;
};

export type TestResult = {
  id: string;
  title: string;
  file?: string;
  status: "passed" | "failed" | "skipped" | "running";
  durationMs: number;
  error?: string;
};

export type RunRecord = {
  status: TestStatus;
  startedAt: string | null;
  finishedAt: string | null;
  durationMs: number | null;
  headed: boolean;
  piwiUrl: string;
  tests: TestResult[];
  steps: LiveStep[];
  error?: string;
};

export function createIdleRun(): RunRecord {
  return {
    status: "idle",
    startedAt: null,
    finishedAt: null,
    durationMs: null,
    headed: true,
    piwiUrl: "",
    tests: TEST_CATALOG.map((t) => ({
      id: t.id,
      title: t.title,
      file: t.file,
      status: "skipped",
      durationMs: 0,
    })),
    steps: [],
  };
}

export const EMPTY_RUN = createIdleRun();
