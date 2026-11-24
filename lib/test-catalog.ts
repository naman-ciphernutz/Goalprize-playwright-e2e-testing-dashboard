export type CatalogTest = {
  id: string;
  title: string;
  file: string;
  description: string;
};

/** Goalprize Admin — login + core features shown in the dashboard. */
export const TEST_CATALOG: CatalogTest[] = [
  {
    id: "admin-login-page",
    title: "Login — admin sign-in page loads",
    file: "tests/admin/login.spec.ts",
    description: "Opens Goalprize Admin and verifies the sign-in form.",
  },
  {
    id: "admin-login-validation",
    title: "Login — required fields validation",
    file: "tests/admin/login.spec.ts",
    description: "Empty Sign in shows the required-fields error.",
  },
  {
    id: "admin-login-success",
    title: "Login — valid admin credentials",
    file: "tests/admin/login.spec.ts",
    description: "Signs in with admin credentials and reaches post-login flow.",
  },
  {
    id: "admin-dashboard-core",
    title: "Core — statistics dashboard loads",
    file: "tests/admin/core.spec.ts",
    description: "After login, the admin statistics dashboard is available.",
  },
];
