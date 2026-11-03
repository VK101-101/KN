import Link from "next/link";
import type { Metadata } from "next";
import { computeKundli, type KundliResult } from "@/lib/astro";
import { PLANETS, RASHIS } from "@/lib/astro/constants";
import { ChartPair, NorthChart } from "@/components/charts";
import { PrintButton } from "@/components/print-button";
import {
  AshtakavargaPanel,
  InterpretationPanel,
  KeyFacts,
  PanchangSummary,
  PlanetTable,
  SadeSatiPanel,
  ShadbalaPanel,
  TransitPanel,
  VargaTable,
  VimshopakaPanel,
  YogaGrid,
} from "@/components/panels";
import { birthQuery, parseBirthParams, parseOptions, type QueryParams } from "@/lib/query";
import { dateRange, fmtJdTime, longDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Printable report",
  description: "A print-ready Vedic birth chart report: charts, dashas, yogas, strength and reading.",
};

function SectionHead({ n, title, note }: { n: string; title: string; note?: string }) {
  return (
    <div className="mb-3 flex items-baseline gap-3 border-b border-line pb-2">
      <span className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-saffron">{n}</span>
      <h2 className="font-display text-lg font-semibold text-brand-dark">{title}</h2>
      {note && <span className="ml-auto hidden text-[0.65rem] text-muted sm:block">{note}</span>}
    </div>
  );
}

function ReportChart({ result }: { result: KundliResult }) {
  const retro = result.chart.grahas.filter((g) => g.retrograde).map((g) => g.planet);
  const combust = result.chart.grahas.filter((g) => g.combust).map((g) => g.planet);
  const d9 = result.vargas.find((v) => v.key === "D9");
  const d10 = result.vargas.find((v) => v.key === "D10");
  return (
    <div className="space-y-4">
      <ChartPair
        bySign={result.chart.bySign}
        lagnaSign={result.chart.lagna.sign}
        title="D1 · Rashi"
        subtitle={`${RASHIS[result.chart.lagna.sign].name} lagna`}
        retrograde={retro}
        combust={combust}
        size="sm"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {[d9, d10].filter(Boolean).map((v) => (
          <div key={v!.key} className="rounded-xl border border-line bg-white/60 p-2">
            <NorthChart
              bySign={v!.bySign}
              lagnaSign={v!.lagnaSign}
              title={`${v!.key} · ${v!.name}`}
              subtitle={`Lagna ${RASHIS[v!.lagnaSign].name}`}
              retrograde={retro}
              combust={combust}
              size="sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<QueryParams>;
}) {
  const sp = await searchParams;
  const input = parseBirthParams(sp);
  const options = parseOptions(sp);

  let result: KundliResult | null = null;
  let error: string | null = null;
  try {
    result = computeKundli(input, options);
  } catch (e) {
    error = e instanceof Error ? e.message : "The report could not be generated.";
  }

  if (!result) {
    return (
      <div className="container-page py-16">
        <div className="card mx-auto max-w-lg p-8 text-center">
          <p className="eyebrow">Report</p>
          <h1 className="display mt-2 text-2xl font-semibold text-brand-dark">Report could not be generated</h1>
          <p className="mt-3 text-sm text-muted">{error}</p>
          <Link href="/kundli" className="btn btn-primary mt-5">
            Back to the form
          </Link>
        </div>
      </div>
    );
  }

  const { chart, panchang } = result;
  const moon = chart.grahas[1];
  const kundliHref = `/kundli?${birthQuery(input, options).toString()}`;
  const generated = new Date().toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" });

  return (
    <div className="container-page py-8 print:max-w-none print:py-0">
      <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Printable report</p>
          <h1 className="display mt-1 text-2xl font-semibold text-brand-dark">Full kundli report</h1>
        </div>
        <div className="flex gap-2">
          <Link href={kundliHref} className="btn btn-ghost text-sm">
            ← Back to chart
          </Link>
          <PrintButton />
        </div>
      </div>

      <article className="space-y-4">
        {/* ---------------- cover / identity ---------------- */}
        <header className="card overflow-hidden">
          <div className="border-b border-line bg-gradient-to-r from-brand-soft via-paper-deep to-paper px-5 py-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-saffron">
                  Jyotisha Kundli · Vedic birth report
                </p>
                <h2 className="display mt-1 text-3xl font-semibold text-brand-dark">{chart.input.name}</h2>
                <p className="mt-1 text-sm text-muted">
                  {longDate(chart.input.date)} · {chart.input.time} · {chart.input.place}
                </p>
              </div>
              <div className="text-right text-[0.7rem] leading-relaxed text-muted">
                <p>Lahiri ayanamsa · {chart.ayanamsa.toFixed(4)}°</p>
                <p>Swiss Ephemeris · whole-sign bhavas</p>
                <p>Generated {generated}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4 px-5 py-4">
            <KeyFacts result={result} />
            <div className="grid gap-x-8 gap-y-1.5 text-[0.8rem] sm:grid-cols-3">
              <div className="flex justify-between gap-3 border-b border-line/70 pb-1">
                <span className="text-muted">Latitude / longitude</span>
                <span className="font-medium">
                  {chart.input.lat.toFixed(4)}°, {chart.input.lon.toFixed(4)}°
                </span>
              </div>
              <div className="flex justify-between gap-3 border-b border-line/70 pb-1">
                <span className="text-muted">Timezone</span>
                <span className="font-medium">{chart.input.tz}</span>
              </div>
              <div className="flex justify-between gap-3 border-b border-line/70 pb-1">
                <span className="text-muted">UTC of birth</span>
                <span className="font-medium">
                  {chart.utc.toISOString().slice(0, 16).replace("T", " ")} UT
                </span>
              </div>
              <div className="flex justify-between gap-3 border-b border-line/70 pb-1">
                <span className="text-muted">Rashi (Moon)</span>
                <span className="font-medium">
                  {RASHIS[moon.sign].name} · {moon.nakshatra} p{moon.pada}
                </span>
              </div>
              <div className="flex justify-between gap-3 border-b border-line/70 pb-1">
                <span className="text-muted">Nakshatra lord</span>
                <span className="font-medium">{PLANETS[moon.nakshatraLord].name}</span>
              </div>
              <div className="flex justify-between gap-3 border-b border-line/70 pb-1">
                <span className="text-muted">Balance of dasha</span>
                <span className="font-medium">
                  {PLANETS[result.dashas.startLord].name} {result.dashas.balanceYears.toFixed(2)} y
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ---------------- panchang ---------------- */}
        <section className="card p-4 sm:p-5">
          <SectionHead n="01" title="Panchang at birth" note={panchang.weekdayName} />
          <PanchangSummary panchang={panchang} tz={chart.input.tz} />
          <div className="mt-3 grid gap-x-8 gap-y-1.5 text-[0.8rem] sm:grid-cols-3">
            <div className="flex justify-between gap-3">
              <span className="text-muted">Sunrise / sunset</span>
              <span className="font-medium">
                {fmtJdTime(panchang.sunriseJd, chart.input.tz)} / {fmtJdTime(panchang.sunsetJd, chart.input.tz)}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted">Lunar month</span>
              <span className="font-medium">{panchang.lunarMonth.purnimantaName}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted">Samvat</span>
              <span className="font-medium">
                Vikram {panchang.samvat.vikram} · Shaka {panchang.samvat.shaka}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted">Ritu / ayana</span>
              <span className="font-medium">
                {panchang.ritu} · {panchang.ayana}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted">Moon / Sun rashi</span>
              <span className="font-medium">
                {RASHIS[panchang.moonSign].name} / {RASHIS[panchang.sunSign].name}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted">Abhijit muhurat</span>
              <span className="font-medium">
                {fmtJdTime(panchang.abhijit.startJd, chart.input.tz)} – {fmtJdTime(panchang.abhijit.endJd, chart.input.tz)}
              </span>
            </div>
          </div>
        </section>

        {/* ---------------- charts ---------------- */}
        <section className="card p-4 sm:p-5 print-break">
          <SectionHead n="02" title="Charts" note="D1 · D9 · D10" />
          <ReportChart result={result} />
        </section>

        {/* ---------------- planets ---------------- */}
        <section className="card p-4 sm:p-5">
          <SectionHead n="03" title="Planetary positions" note="Sidereal · Lahiri" />
          <PlanetTable chart={chart} compact />
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[0.65rem] text-muted">
            {PLANETS.map((p) => (
              <span key={p.id} className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                {p.short} = {p.name}
              </span>
            ))}
            <span>R = retrograde · * = combust</span>
          </div>
        </section>

        {/* ---------------- vargas ---------------- */}
        <section className="card p-4 sm:p-5">
          <SectionHead n="04" title="Divisional charts (vargas)" note="BPHS Parashari" />
          <VargaTable result={result} />
        </section>

        {/* ---------------- dashas ---------------- */}
        <section className="card p-4 sm:p-5 print-break">
          <SectionHead n="05" title="Vimshottari dasha" note="365.25-day year" />
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <h3 className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted">
                Running chain
              </h3>
              <table className="data-table mt-2">
                <thead>
                  <tr>
                    <th>Level</th>
                    <th>Lord</th>
                    <th>Period</th>
                  </tr>
                </thead>
                <tbody>
                  {result.dashas.chain.map((c) => (
                    <tr key={`${c.level}-${c.startJd}`}>
                      <td className="text-muted">
                        {["Maha", "Antar", "Pratyantar", "Sookshma", "Prana"][c.level - 1] ?? `Level ${c.level}`}
                      </td>
                      <td className="font-semibold">{PLANETS[c.lord].name}</td>
                      <td className="text-muted">{dateRange(c.startJd, c.endJd, chart.input.tz)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-[0.7rem] text-muted">
                Balance at birth: {result.dashas.balanceYears.toFixed(3)} years of{" "}
                {PLANETS[result.dashas.startLord].name}.
              </p>
            </div>
            <div>
              <h3 className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted">
                Mahadasha sequence
              </h3>
              <table className="data-table mt-2">
                <thead>
                  <tr>
                    <th>Lord</th>
                    <th>From</th>
                    <th>To</th>
                  </tr>
                </thead>
                <tbody>
                  {result.dashas.tree.map((d) => (
                    <tr key={`${d.lord}-${d.startJd}`}>
                      <td className="font-semibold">{PLANETS[d.lord].name}</td>
                      <td className="text-muted">{dateRange(d.startJd, d.endJd, chart.input.tz).split(" – ")[0]}</td>
                      <td className="text-muted">{dateRange(d.startJd, d.endJd, chart.input.tz).split(" – ")[1]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ---------------- yogas ---------------- */}
        <section className="space-y-3">
          <SectionHead n="06" title="Yogas" note={`${result.yogas.length} detected`} />
          <YogaGrid yogas={result.yogas} />
        </section>

        {/* ---------------- strength ---------------- */}
        <section className="card p-4 sm:p-5 print-break">
          <SectionHead n="07" title="Strength" note="Shadbala · Vimshopaka · Ashtakavarga" />
          <h3 className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted">Shadbala</h3>
          <div className="mt-2">
            <ShadbalaPanel rows={result.shadbala} />
          </div>
          <h3 className="mt-5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted">
            Vimshopaka
          </h3>
          <div className="mt-2">
            <VimshopakaPanel rows={result.vimshopaka} />
          </div>
          <h3 className="mt-5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted">
            Ashtakavarga
          </h3>
          <div className="mt-2">
            <AshtakavargaPanel av={result.ashtakavarga} />
          </div>
        </section>

        {/* ---------------- reading ---------------- */}
        <section className="space-y-3 print-break">
          <SectionHead n="08" title="Reading" note="Generated from this chart" />
          <InterpretationPanel reading={result.interpretation} />
        </section>

        {/* ---------------- timing ---------------- */}
        <section className="card p-4 sm:p-5">
          <SectionHead n="09" title="Transits & Sade Sati" note="As of today" />
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted">Sade Sati</h3>
              <div className="mt-2">
                <SadeSatiPanel info={result.sadeSati} tz={chart.input.tz} />
              </div>
            </div>
            <div>
              <h3 className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted">
                Current transits
              </h3>
              <div className="mt-2">
                <TransitPanel transits={result.transits} tz={chart.input.tz} />
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- notes ---------------- */}
        <footer className="rounded-xl border border-line bg-paper-deep/50 p-4 text-[0.72rem] leading-relaxed text-muted">
          <p className="font-semibold text-ink">Notes on this report</p>
          <p className="mt-1">
            Positions are sidereal (Lahiri / Chitrapaksha) from the Swiss Ephemeris, with the mean lunar node
            and whole-sign bhavas. The dasha year is 365.25 days. Shadbala is in virupas (60 virupas = 1
            rupa); the required minimum follows classical values. Sade Sati is Saturn transiting the 12th,
            1st and 2nd signs from the natal Moon. A birth time error of four minutes moves the lagna by
            about one degree — verify the lagna when it sits near a sign boundary.
          </p>
          <p className="mt-2">
            This report is generated for study and guidance. It is not medical, legal or financial advice,
            and not a substitute for a consultation with a qualified astrologer. Ashtakavarga tables follow
            B. V. Raman&apos;s classical layout (via VedAstro, MIT).
          </p>
          <p className="mt-2">Jyotisha Kundli · computed {generated}</p>
        </footer>
      </article>

      <div className="no-print mt-6 flex flex-wrap items-center justify-between gap-3">
        <Link href={kundliHref} className="btn btn-ghost text-sm">
          ← Back to chart
        </Link>
        <PrintButton label="Print this report" />
      </div>
    </div>
  );
}
