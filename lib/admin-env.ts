/** Public staging admin web — no secrets here. */
export const ADMIN_BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL ||
  process.env.GOALPRIZE_ADMIN_URL ||
  "https://admin-staging.goalprize.com";
