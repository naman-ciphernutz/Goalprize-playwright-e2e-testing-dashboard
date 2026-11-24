import { expect, test } from "../fixtures";

test.describe("Goalprize Admin — Login", () => {
  test("Login — admin sign-in page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /GoalPrize Admin/i })).toBeVisible();
    await expect(page.getByPlaceholder("Email")).toBeVisible();
    await expect(page.getByPlaceholder("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: /Sign in/i })).toBeVisible();
  });

  test("Login — required fields validation", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Sign in/i }).click();
    await expect(page.getByRole("alert")).toContainText(
      /Please fill up all required fields/i,
    );
  });

  test("Login — valid admin credentials", async ({ page }) => {
    const email = process.env.ADMIN_TEST_EMAIL;
    const password = process.env.ADMIN_TEST_PASSWORD;
    test.skip(!email || !password, "Set ADMIN_TEST_EMAIL and ADMIN_TEST_PASSWORD to run.");

    await page.goto("/");
    await page.getByPlaceholder("Email").fill(email!);
    await page.getByPlaceholder("Password").fill(password!);
    await page.getByRole("button", { name: /Sign in/i }).click();
    await expect(page).not.toHaveURL(/\/login\/?$/, { timeout: 20_000 });
  });
});
