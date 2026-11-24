import { NextResponse } from "next/server";
import { createIdleRun } from "@/lib/run-types";

/** Last-run state is kept in the browser for Vercel (no durable disk). */
export async function GET() {
  return NextResponse.json(createIdleRun());
}
