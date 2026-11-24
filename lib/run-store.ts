import { promises as fs } from "fs";
import path from "path";
import { createIdleRun, type LiveStep, type RunRecord } from "./run-types";

const DATA_DIR = path.join(process.cwd(), ".data");
const RUN_FILE = path.join(DATA_DIR, "last-run.json");

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readRun(): Promise<RunRecord> {
  try {
    const raw = await fs.readFile(RUN_FILE, "utf8");
    return JSON.parse(raw) as RunRecord;
  } catch {
    return createIdleRun();
  }
}

export async function writeRun(run: RunRecord): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(RUN_FILE, JSON.stringify(run, null, 2), "utf8");
}

export async function appendStep(message: string): Promise<void> {
  const run = await readRun();
  const step: LiveStep = { at: new Date().toISOString(), message };
  run.steps = [...run.steps.slice(-80), step];
  await writeRun(run);
}
