import type { Metadata } from "next";
import Link from "next/link";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const body = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Goalprize Admin",
  description: "Goalprize Admin operations console.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${body.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <div className="qa-shell">
          <header className="border-b border-[var(--qa-border)] bg-[rgba(18,23,31,0.92)] backdrop-blur">
            <div className="mx-auto flex h-14 w-full max-w-[1280px] items-center justify-between px-4 md:px-6">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--qa-accent)] text-sm font-bold text-[#041018]">
                  G
                </span>
                <div>
                  <p className="text-sm font-semibold tracking-tight">
                    Goalprize Admin
                  </p>
                  <p className="text-[11px] text-[var(--qa-muted)]">
                    Staging · admin-staging.goalprize.com
                  </p>
                </div>
              </div>
              <nav className="hidden items-center gap-1 text-sm sm:flex">
                <Link
                  href="/"
                  className="rounded-md bg-[var(--qa-panel-2)] px-3 py-1.5 text-[var(--qa-text)]"
                >
                  Overview
                </Link>
                <span className="px-3 py-1.5 text-[var(--qa-muted)]">Runs</span>
                <span className="px-3 py-1.5 text-[var(--qa-muted)]">Checks</span>
              </nav>
            </div>
          </header>
          <main className="mx-auto w-full max-w-[1280px] px-4 py-6 md:px-6 md:py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
