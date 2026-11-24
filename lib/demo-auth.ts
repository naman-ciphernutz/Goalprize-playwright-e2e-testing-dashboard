export const DEMO_EMAIL = "demo@goalprize.test";
export const DEMO_PASSWORD = "demo1234";

export function isValidDemoLogin(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD
  );
}
