import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-16">
      <p className="text-sm uppercase tracking-[0.18em] text-ink-muted">About</p>
      <h1
        data-testid="about-heading"
        className="mt-4 font-[family-name:var(--font-display)] text-5xl tracking-tight"
      >
        About Demo Store
      </h1>
      <p className="mt-4 text-lg text-ink-muted">
        A small app under test for the Playwright + Piwi platform demo. Keep
        adding pages and specs as coverage grows.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-full border border-line px-5 py-3 text-sm transition hover:border-accent hover:text-accent"
        >
          Login
        </Link>
        <Link
          href="/products"
          className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover"
        >
          Products
        </Link>
      </div>
    </main>
  );
}
