import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-16">
      <div className="rounded-[28px] border border-line bg-panel p-10 shadow-[0_24px_60px_rgba(28,36,32,0.08)]">
        <p className="text-sm uppercase tracking-[0.18em] text-ok">Success</p>
        <h1
          data-testid="login-success"
          className="mt-4 font-[family-name:var(--font-display)] text-5xl tracking-tight"
        >
          Logged in
        </h1>
        <p className="mt-4 max-w-lg text-lg text-ink-muted">
          The Playwright login test looks for this message after a valid sign-in.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-full border border-line px-5 py-3 text-sm transition hover:border-accent hover:text-accent"
          >
            Back to login
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover"
          >
            Open dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
