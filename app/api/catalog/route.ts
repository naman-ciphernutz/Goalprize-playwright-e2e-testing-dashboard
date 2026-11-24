import { NextResponse } from "next/server";
import { TEST_CATALOG } from "@/lib/test-catalog";

export async function GET() {
  return NextResponse.json({
    tests: TEST_CATALOG,
    project: "Goalprize Admin",
    target: "https://admin-staging.goalprize.com",
  });
}
