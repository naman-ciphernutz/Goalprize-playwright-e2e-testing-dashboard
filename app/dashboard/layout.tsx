import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="qa-shell">
      <div className="border-b border-[var(--qa-border)] bg-[#15120c] px-4 py-2 text-center text-xs text-[var(--qa-run)]">
        Goalprize Admin · Playwright testing dashboard
      </div>
      <div className="mx-auto flex min-h-[calc(100vh-36px)] w-full max-w-[1400px]">
        <aside className="hidden w-56 shrink-0 border-r border-[var(--qa-border)] bg-[var(--qa-panel)] p-4 md:block">
          <div className="mb-8 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-bold text-white">
              T
            </span>
            <div>
              <p className="text-sm font-semibold">Test Dashboard</p>
              <p className="text-[11px] text-[var(--qa-muted)]">Playwright</p>
            </div>
          </div>
          <nav className="space-y-1 text-sm">
            <Link
              href="/dashboard"
              className="block rounded-lg bg-[var(--qa-panel-2)] px-3 py-2 text-[var(--qa-text)]"
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className="block rounded-lg px-3 py-2 text-[var(--qa-muted)] hover:bg-[var(--qa-panel-2)] hover:text-[var(--qa-text)]"
            >
              Projects
            </Link>
            <Link
              href="/"
              className="block rounded-lg px-3 py-2 text-[var(--qa-muted)] hover:bg-[var(--qa-panel-2)] hover:text-[var(--qa-text)]"
            >
              App under test
            </Link>
          </nav>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
