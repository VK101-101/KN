import Link from "next/link";

function Mark() {
  return (
    <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden className="shrink-0">
      <circle cx="20" cy="20" r="18.5" fill="#4a3a86" />
      <circle cx="20" cy="20" r="18.5" fill="none" stroke="#c7a86a" strokeWidth="1" />
      <g stroke="#f3e7c8" strokeWidth="1.1" fill="none" strokeLinecap="round">
        <path d="M20 7 L23 17 L33 20 L23 23 L20 33 L17 23 L7 20 L17 17 Z" />
        <circle cx="20" cy="20" r="4.2" />
        <path d="M20 3.5 L20 8 M20 32 L20 36.5 M3.5 20 L8 20 M32 20 L36.5 20" />
      </g>
      <circle cx="20" cy="20" r="1.9" fill="#d9a441" />
    </svg>
  );
}

const NAV = [
  { href: "/", label: "Home" },
  { href: "/kundli", label: "Kundli" },
  { href: "/matching", label: "Matching" },
  { href: "/panchang", label: "Panchang" },
];

export function SiteHeader() {
  return (
    <header className="no-print sticky top-0 z-40 border-b border-line/80 bg-paper/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Mark />
          <span className="leading-tight">
            <span className="display block text-[1.15rem] font-semibold text-brand-dark">Jyotisha Kundli</span>
            <span className="block text-[0.62rem] font-medium uppercase tracking-[0.22em] text-muted">
              Vedic astrology studio
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-muted transition-colors hover:bg-brand-soft hover:text-brand-dark"
            >
              {n.label}
            </Link>
          ))}
          <Link href="/kundli" className="btn btn-primary ml-2 !px-4 !py-2 text-sm">
            Free kundli
          </Link>
        </nav>

        <Link href="/kundli" className="btn btn-primary !px-4 !py-2 text-xs sm:hidden">
          Kundli
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="no-print mt-20 border-t border-line bg-paper-deep/60">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <Mark />
            <span className="display text-lg font-semibold text-brand-dark">Jyotisha Kundli</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
            A complete Vedic astrology workspace: birth chart, Vimshottari dasha, panchang,
            Ashtakoot matching and a printable report. Positions are computed with the Swiss
            Ephemeris, the same engine used by professional Jyotisha software.
          </p>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Explore</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[...NAV, { href: "/report", label: "Printable report" }].map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="text-ink/80 transition-colors hover:text-brand">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Conventions</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            <li>Lahiri / Chitrapaksha ayanamsa</li>
            <li>Mean lunar node, whole-sign houses</li>
            <li>365.25-day Vimshottari year</li>
            <li>Swiss Ephemeris (Astrodienst)</li>
          </ul>
        </div>
      </div>
      <div className="hairline" />
      <div className="container-page flex flex-col gap-2 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Jyotisha Kundli. For study and guidance, not a substitute for professional advice.</p>
        <p>
          Ephemeris: Swiss Ephemeris · Ashtakavarga tables: B. V. Raman / VedAstro (MIT)
        </p>
      </div>
    </footer>
  );
}
