import Link from "next/link";
import { BirthForm } from "@/components/birth-form";

const FEATURES = [
  {
    title: "Swiss Ephemeris precision",
    body: "The same engine used by Jagannatha Hora, Parashara's Light and AstroSage. Sidereal positions, Lahiri ayanamsa, mean node, whole-sign bhavas.",
    tag: "Astronomy",
  },
  {
    title: "Vimshottari to five levels",
    body: "Maha, antar, pratyantar, sookshma and prana dashas with a 365.25-day year, plus the Yogini cycle and a balance-at-birth calculation.",
    tag: "Timing",
  },
  {
    title: "Sixteen divisional charts",
    body: "D1 through D60 with the BPHS Parashari mappings. Navamsa, Dashamsha and the rest are drawn in both North and South Indian styles.",
    tag: "Vargas",
  },
  {
    title: "Panchang & muhurat",
    body: "Tithi, nakshatra, yoga, karana with end times, sunrise/sunset, choghadiya, Rahu kaal, Abhijit, horas and the Vedic calendar.",
    tag: "Calendar",
  },
  {
    title: "Ashtakoot matching",
    body: "The full 36-guna Milan with Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot and Nadi, plus Mangal dosha on both charts.",
    tag: "Compatibility",
  },
  {
    title: "Yogas, strength & report",
    body: "Panch Mahapurusha, Raja, Dhana, Vipreet and Chandra yogas; Shadbala, Vimshopaka, Ashtakavarga and a print-ready PDF report.",
    tag: "Analysis",
  },
];

const CONVENTIONS = [
  ["Ayanamsa", "Lahiri / Chitrapaksha"],
  ["Lunar node", "Mean (true node optional)"],
  ["Houses", "Whole sign · Sripati optional"],
  ["Dasha year", "365.25 days"],
  ["Ephemeris", "Swiss Ephemeris (DE431)"],
  ["Node & bhava", "Classical BPHS"],
];

export default function Home() {
  return (
    <div>
      {/* ---------------- hero ---------------- */}
      <section className="relative overflow-hidden border-b border-line/70">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-40 h-[540px] w-[540px] rounded-full border border-brand/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-28 h-[400px] w-[400px] rounded-full border border-brand/15"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-16 h-[260px] w-[260px] rounded-full border border-saffron/20"
        />

        <div className="container-page relative grid items-start gap-12 py-12 lg:grid-cols-[1.03fr_0.97fr] lg:py-16">
          <div className="pt-2">
            <p className="eyebrow">Jyotisha · the science of light</p>
            <h1 className="display mt-3 text-[2.6rem] font-semibold text-brand-dark sm:text-6xl">
              Your kundli,
              <br />
              <span className="text-saffron">computed like a professional.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[1.02rem] leading-relaxed text-muted">
              A complete Vedic astrology workspace: precise birth chart, five-level Vimshottari dasha,
              sixteen divisional charts, panchang, Ashtakoot matching and a printable report — all from
              the Swiss Ephemeris and classical Parashari rules.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="chip">Lahiri ayanamsa</span>
              <span className="chip">Whole-sign bhavas</span>
              <span className="chip">365.25-day dasha year</span>
              <span className="chip">D1–D60</span>
              <span className="chip">No sign-up</span>
            </div>

            <div className="mt-8 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-6">
              {[
                ["16", "divisional charts"],
                ["5", "dasha levels"],
                ["337", "ashtakavarga bindus"],
              ].map(([n, l]) => (
                <div key={l}>
                  <p className="display text-2xl font-semibold text-brand">{n}</p>
                  <p className="text-[0.7rem] uppercase tracking-[0.1em] text-muted">{l}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/panchang" className="btn btn-ghost">
                Today&apos;s panchang
              </Link>
              <Link href="/matching" className="btn btn-ghost">
                Kundli matching
              </Link>
            </div>
          </div>

          <div className="card relative p-5 sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">Free birth chart</p>
                <h2 className="display mt-1 text-2xl font-semibold text-brand-dark">Enter your birth details</h2>
              </div>
              <span className="chip !bg-brand-soft !text-brand-dark">1 minute</span>
            </div>
            <BirthForm />
          </div>
        </div>
      </section>

      {/* ---------------- features ---------------- */}
      <section className="container-page py-14">
        <div className="max-w-2xl">
          <p className="eyebrow">What is inside</p>
          <h2 className="display mt-2 text-3xl font-semibold text-brand-dark sm:text-4xl">
            Everything a serious kundli needs, without the clutter.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            The calculations follow the conventions of the software working astrologers use, so the
            numbers match the charts they already read. The presentation is built for reading, printing
            and sharing.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <article key={f.title} className="card group p-5 transition-transform hover:-translate-y-0.5">
              <span className="chip !bg-paper-deep">{f.tag}</span>
              <h3 className="mt-3 font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-[0.84rem] leading-relaxed text-muted">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ---------------- conventions ---------------- */}
      <section className="border-y border-line bg-paper-deep/50">
        <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_1.15fr]">
          <div>
            <p className="eyebrow">Conventions</p>
            <h2 className="display mt-2 text-3xl font-semibold text-brand-dark">
              Reproducible, documented, classical.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
              Every setting is visible in the form. If a chart differs from another site, compare the
              ayanamsa, node and house system first — those three account for most discrepancies.
            </p>
            <Link href="/kundli" className="btn btn-primary mt-6">
              Generate a kundli
            </Link>
          </div>
          <dl className="grid gap-x-8 gap-y-3 self-center sm:grid-cols-2">
            {CONVENTIONS.map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-3 border-b border-line pb-2">
                <dt className="text-sm text-muted">{k}</dt>
                <dd className="text-right text-sm font-medium text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="container-page py-14">
        <div className="card overflow-hidden">
          <div className="grid gap-8 bg-gradient-to-br from-brand-soft via-card to-paper p-7 sm:p-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <p className="eyebrow">Start here</p>
              <h2 className="display mt-2 text-3xl font-semibold text-brand-dark">
                Three ways to use Jyotisha Kundli
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
                Read your own chart in depth, check a match before a family meeting, or use the daily
                panchang to choose a muhurat. Everything runs in the browser and nothing is stored.
              </p>
            </div>
            <div className="grid gap-3">
              <Link href="/kundli" className="flex items-center justify-between rounded-xl border border-line bg-card px-4 py-3 transition-colors hover:border-brand/40">
                <span>
                  <span className="block text-sm font-semibold">Birth chart & report</span>
                  <span className="block text-xs text-muted">Charts, dashas, yogas, PDF</span>
                </span>
                <span className="text-brand">→</span>
              </Link>
              <Link href="/matching" className="flex items-center justify-between rounded-xl border border-line bg-card px-4 py-3 transition-colors hover:border-brand/40">
                <span>
                  <span className="block text-sm font-semibold">Marriage matching</span>
                  <span className="block text-xs text-muted">36-guna Milan & Mangal dosha</span>
                </span>
                <span className="text-brand">→</span>
              </Link>
              <Link href="/panchang" className="flex items-center justify-between rounded-xl border border-line bg-card px-4 py-3 transition-colors hover:border-brand/40">
                <span>
                  <span className="block text-sm font-semibold">Panchang & muhurat</span>
                  <span className="block text-xs text-muted">Any date, any place</span>
                </span>
                <span className="text-brand">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
