import { expect, test } from "../fixtures";

test.describe("Goalprize Admin — Core", () => {
  test("Core — statistics dashboard loads", async ({ page }) => {
    const email = process.env.ADMIN_TEST_EMAIL;
    const password = process.env.ADMIN_TEST_PASSWORD;
    test.skip(!email || !password, "Set ADMIN_TEST_EMAIL and ADMIN_TEST_PASSWORD to run.");

    await page.goto("/");
    await page.getByPlaceholder("Email").fill(email!);
    await page.getByPlaceholder("Password").fill(password!);
    await page.getByRole("button", { name: /Sign in/i }).click();
    await page.goto("/dashboard/statistics");
    await expect(page.locator("body")).toBeVisible();
    await expect(page).toHaveURL(/statistics|2fa|dashboard/i);
  });
});
