import { defineConfig, devices } from "@playwright/test";

const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ||
  process.env.GOALPRIZE_ADMIN_URL ||
  "https://admin-staging.goalprize.com";

const headed = process.env.HEADED === "1" || process.env.HEADED === "true";
const slowMo = headed ? Number(process.env.SLOW_MO ?? 400) : 0;

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/admin/**/*.spec.ts",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 60_000,
  reporter: [
    ["list"],
    ["json", { outputFile: ".data/playwright-report.json" }],
    ["html", { open: "never", outputFolder: "playwright-report" }],
  ],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    headless: !headed,
    launchOptions: { slowMo },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
