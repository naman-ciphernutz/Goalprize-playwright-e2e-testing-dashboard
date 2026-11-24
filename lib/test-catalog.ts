export type CatalogTest = {
  id: string;
  title: string;
  file: string;
  description: string;
};

export const TEST_CATALOG: CatalogTest[] = [
  {
    id: "admin-login-page",
    title: "Login — admin sign-in page loads",
    file: "tests/admin/login.spec.ts",
    description:
      "Opens admin-staging, lands on /login, verifies GoalPrize Admin form and Sign in.",
  },
  {
    id: "admin-login-validation",
    title: "Login — required fields validation",
    file: "tests/admin/login.spec.ts",
    description:
      "Empty Sign in shows “Please fill up all required fields” without calling the API.",
  },
  {
    id: "admin-login-success",
    title: "Login — valid admin credentials",
    file: "tests/admin/login.spec.ts",
    description:
      "POST /auth/admin/login, stores auth-token, navigates to /2fa-setup.",
  },
  {
    id: "admin-dashboard-core",
    title: "Core — statistics dashboard loads",
    file: "tests/admin/core.spec.ts",
    description:
      "Loads /dashboard/statistics with Today / Weekly / Monthly controls.",
  },
];
