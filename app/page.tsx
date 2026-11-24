"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { DEMO_EMAIL, DEMO_PASSWORD, isValidDemoLogin } from "@/lib/demo-auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }
    if (!isValidDemoLogin(email, password)) {
      setError("Invalid email or password.");
      return;
    }
    setError(null);
    window.location.assign("/success");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-10">
      <header className="mb-16 flex items-center justify-between gap-4">
        <p className="font-[family-name:var(--font-display)] text-2xl tracking-tight">
          Demo Store
        </p>
        <Link
          href="/dashboard"
          className="rounded-full border border-line bg-panel px-4 py-2 text-sm text-ink-muted transition hover:border-accent hover:text-accent"
        >
          Open testing dashboard
        </Link>
      </header>

      <section className="grid flex-1 items-center gap-12 md:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <p className="text-sm uppercase tracking-[0.18em] text-ink-muted">
            Client demo
          </p>
          <h1 className="max-w-xl font-[family-name:var(--font-display)] text-5xl leading-[1.05] tracking-tight md:text-6xl">
            Sign in to try the login test target.
          </h1>
          <p className="max-w-md text-lg text-ink-muted">
            This page is the app under test. Use the dashboard to run the
            Playwright login check and see Pass / Fail.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-[28px] border border-line bg-panel p-8 shadow-[0_24px_60px_rgba(28,36,32,0.08)]"
          noValidate
        >
          <h2 className="mb-6 font-[family-name:var(--font-display)] text-3xl">
            Login
          </h2>

          <label className="mb-4 block space-y-2">
            <span className="text-sm text-ink-muted">Email</span>
            <input
              data-testid="login-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-line bg-white px-4 py-3 outline-none ring-accent focus:ring-2"
              placeholder="demo@goalprize.test"
            />
          </label>

          <label className="mb-4 block space-y-2">
            <span className="text-sm text-ink-muted">Password</span>
            <input
              data-testid="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-line bg-white px-4 py-3 outline-none ring-accent focus:ring-2"
              placeholder="••••••••"
            />
          </label>

          {error ? (
            <p
              data-testid="login-error"
              className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-danger"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <button
            data-testid="login-submit"
            type="submit"
            className="mt-2 w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover"
          >
            Sign in
          </button>

          <p className="mt-5 text-sm text-ink-muted">
            Demo credentials:{" "}
            <code className="rounded bg-[#efe8da] px-1.5 py-0.5">
              {DEMO_EMAIL}
            </code>{" "}
            /{" "}
            <code className="rounded bg-[#efe8da] px-1.5 py-0.5">
              {DEMO_PASSWORD}
            </code>
          </p>
        </form>
      </section>
    </main>
  );
}
