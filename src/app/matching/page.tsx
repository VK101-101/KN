import Link from "next/link";
import type { Metadata } from "next";
import { buildChart, type Chart } from "@/lib/astro/chart";
import { matchCharts } from "@/lib/astro/matching";
import { PLANETS, RASHIS } from "@/lib/astro/constants";
import { NorthChart } from "@/components/charts";
import { MatchingForm } from "@/components/matching-form";
import { Pill } from "@/components/panels";
import { birthQuery, parseBirthParams, parseOptions, type QueryParams } from "@/lib/query";
import { dms, longDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kundli matching",
  description:
    "Ashtakoot 36-guna Milan for marriage: Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot and Nadi, with Mangal dosha.",
};

const KUTA_INFO: Record<string, string> = {
  varna: "Spiritual compatibility and the natural order of the two temperaments. One point.",
  vashya: "Mutual influence and the willingness to be led. Two points.",
  tara: "Birth-star compatibility, counted both ways; it governs health and general fortune. Three points.",
  yoni: "Physical and instinctive compatibility, from the animal symbol of each nakshatra. Four points.",
  maitri: "Friendship between the Moon-sign lords, which sets the emotional weather of the marriage. Five points.",
  gana: "Temperament class — Deva, Manushya or Rakshasa. Six points.",
  bhakoot: "Emotional and financial axis between the Moon signs. Seven points.",
  nadi: "Constitutional and genetic harmony, the heaviest kuta. Eight points.",
};

function ScoreRing({ percent, total }: { percent: number; total: number }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const filled = (Math.min(100, Math.max(0, percent)) / 100) * c;
  const tone = total >= 25 ? "#047857" : total >= 18 ? "#a16207" : "#be123c";
  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg viewBox="0 0 110 110" className="h-full w-full -rotate-90">
        <circle cx="55" cy="55" r={r} fill="none" stroke="#e6dcc9" strokeWidth="7" />
        <circle
          cx="55"
          cy="55"
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="display text-3xl font-semibold leading-none" style={{ color: tone }}>
          {total}
        </span>
        <span className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-muted">of 36</span>
      </div>
    </div>
  );
}

function PersonCard({
  role,
  chart,
  mangal,
  href,
}: {
  role: string;
  chart: Chart;
  mangal: boolean;
  href: string;
}) {
  const moon = chart.grahas[1];
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{role}</p>
          <h3 className="mt-0.5 text-lg font-semibold text-brand-dark">{chart.input.name}</h3>
          <p className="text-xs text-muted">
            {longDate(chart.input.date)} · {chart.input.time} · {chart.input.place}
          </p>
        </div>
        <Pill tone={mangal ? "bad" : "good"}>{mangal ? "Mangal dosha" : "No Mangal dosha"}</Pill>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line pt-3 text-[0.8rem]">
        <div>
          <dt className="text-[0.62rem] uppercase tracking-[0.1em] text-muted">Lagna</dt>
          <dd className="font-medium">
            {RASHIS[chart.lagna.sign].name} {dms(chart.lagna.degInSign)}
          </dd>
        </div>
        <div>
          <dt className="text-[0.62rem] uppercase tracking-[0.1em] text-muted">Rashi</dt>
          <dd className="font-medium">{RASHIS[moon.sign].name}</dd>
        </div>
        <div>
          <dt className="text-[0.62rem] uppercase tracking-[0.1em] text-muted">Nakshatra</dt>
          <dd className="font-medium">
            {moon.nakshatra} p{moon.pada}
          </dd>
        </div>
        <div>
          <dt className="text-[0.62rem] uppercase tracking-[0.1em] text-muted">Moon lord</dt>
          <dd className="font-medium">{PLANETS[moon.nakshatraLord].name}</dd>
        </div>
      </dl>
      <Link href={href} className="no-print mt-3 inline-block text-[0.75rem] font-medium text-brand hover:underline">
        Open full kundli →
      </Link>
    </div>
  );
}

export default async function MatchingPage({
  searchParams,
}: {
  searchParams: Promise<QueryParams>;
}) {
  const sp = await searchParams;
  const hasPair = Boolean(sp["bd"] || sp["bn"] || sp["gp"] || sp["gd"]);
  const options = parseOptions(sp);

  const brideInput = parseBirthParams(sp, "b");
  const groomInput = parseBirthParams(sp, "g");

  let bride: Chart | null = null;
  let groom: Chart | null = null;
  let error: string | null = null;

  if (hasPair) {
    try {
      bride = buildChart({ ...brideInput, gender: "female" }, options);
      groom = buildChart({ ...groomInput, gender: "male" }, options);
    } catch (e) {
      error = e instanceof Error ? e.message : "The charts could not be computed.";
    }
  }

  const match = bride && groom ? matchCharts(bride, groom) : null;

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="max-w-3xl">
        <p className="eyebrow">Ashtakoot · 36 guna</p>
        <h1 className="display mt-2 text-3xl font-semibold text-brand-dark sm:text-4xl">Kundli matching</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          The eight kutas are scored from the Moon nakshatra and Moon sign of both charts, the way
          traditional Guna Milan is done. Mangal dosha is checked separately from the lagna, the Moon
          and Venus, with the classical cancellations applied.
        </p>
      </div>

      <div className="mt-7 card p-5 sm:p-6">
        <MatchingForm
          initialBride={hasPair ? { ...brideInput, gender: "female" } : undefined}
          initialGroom={hasPair ? { ...groomInput, gender: "male" } : undefined}
          options={options}
        />
      </div>

      {error && (
        <div className="card mt-6 border-rose-200 bg-rose-50/60 p-5 text-sm text-rose-800">
          {error} Check the dates, times and places, then try again.
        </div>
      )}

      {match && bride && groom && (
        <div className="mt-8 space-y-6">
          <div className="card overflow-hidden">
            <div className="flex flex-wrap items-center gap-6 bg-gradient-to-r from-brand-soft via-paper-deep to-paper px-5 py-6 sm:px-8">
              <ScoreRing percent={match.percent} total={match.total} />
              <div className="min-w-0 flex-1">
                <p className="eyebrow">Guna Milan result</p>
                <h2 className="display mt-1 text-2xl font-semibold text-brand-dark sm:text-3xl">{match.verdict}</h2>
                <p className="mt-1 text-sm text-muted">
                  {match.total} of {match.max} gunas · {match.percent.toFixed(1)}% ·{" "}
                  {match.kutas.filter((k) => k.score === k.max).length} kutas at full marks
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Pill tone={match.brideMangal ? "bad" : "good"}>
                    Bride: {match.brideMangal ? "Mangal dosha" : "no Mangal dosha"}
                  </Pill>
                  <Pill tone={match.groomMangal ? "bad" : "good"}>
                    Groom: {match.groomMangal ? "Mangal dosha" : "no Mangal dosha"}
                  </Pill>
                  {match.total >= 18 ? (
                    <Pill tone="good">Above the 18-guna threshold</Pill>
                  ) : (
                    <Pill tone="bad">Below the 18-guna threshold</Pill>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <PersonCard
              role="Bride"
              chart={bride}
              mangal={match.brideMangal}
              href={`/kundli?${birthQuery(brideInput, options).toString()}`}
            />
            <PersonCard
              role="Groom"
              chart={groom}
              mangal={match.groomMangal}
              href={`/kundli?${birthQuery(groomInput, options).toString()}`}
            />
          </div>

          <div className="card p-4 sm:p-5">
            <h2 className="section-title text-xl">The eight kutas</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Kuta</th>
                    <th>Bride / groom</th>
                    <th className="text-center">Score</th>
                    <th className="w-40">Out of</th>
                    <th className="hidden md:table-cell">What it shows</th>
                  </tr>
                </thead>
                <tbody>
                  {match.kutas.map((k) => (
                    <tr key={k.key}>
                      <td className="font-semibold text-ink">{k.name}</td>
                      <td className="text-muted">{k.detail}</td>
                      <td className="text-center font-semibold">
                        <span className={k.score === k.max ? "text-emerald-700" : k.score === 0 ? "text-rose-700" : ""}>
                          {k.score}
                        </span>
                        <span className="text-muted">/{k.max}</span>
                      </td>
                      <td>
                        <div className="h-1.5 overflow-hidden rounded-full bg-paper-deep">
                          <div
                            className={`h-full rounded-full ${
                              k.score === k.max ? "bg-emerald-500" : k.score === 0 ? "bg-rose-400" : "bg-amber-400"
                            }`}
                            style={{ width: `${(k.score / k.max) * 100}%` }}
                          />
                        </div>
                      </td>
                      <td className="hidden max-w-xs text-[0.75rem] leading-relaxed text-muted md:table-cell">
                        {KUTA_INFO[k.key]}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-brand-soft/60">
                    <td className="font-bold text-brand-dark">Total</td>
                    <td />
                    <td className="text-center text-base font-bold text-brand-dark">{match.total}</td>
                    <td className="font-semibold text-brand-dark">{match.max}</td>
                    <td className="hidden md:table-cell" />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="card p-4">
              <div className="mb-2">
                <p className="eyebrow">Bride</p>
                <h3 className="text-sm font-semibold text-brand-dark">
                  {bride.input.name} · D1 rashi
                </h3>
              </div>
              <NorthChart
                bySign={bride.bySign}
                lagnaSign={bride.lagna.sign}
                title="Bride"
                subtitle={`${RASHIS[bride.lagna.sign].name} lagna`}
                retrograde={bride.grahas.filter((g) => g.retrograde).map((g) => g.planet)}
                combust={bride.grahas.filter((g) => g.combust).map((g) => g.planet)}
                size="sm"
              />
            </div>
            <div className="card p-4">
              <div className="mb-2">
                <p className="eyebrow">Groom</p>
                <h3 className="text-sm font-semibold text-brand-dark">
                  {groom.input.name} · D1 rashi
                </h3>
              </div>
              <NorthChart
                bySign={groom.bySign}
                lagnaSign={groom.lagna.sign}
                title="Groom"
                subtitle={`${RASHIS[groom.lagna.sign].name} lagna`}
                retrograde={groom.grahas.filter((g) => g.retrograde).map((g) => g.planet)}
                combust={groom.grahas.filter((g) => g.combust).map((g) => g.planet)}
                size="sm"
              />
            </div>
          </div>

          <div className="card p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-brand-dark">Reading the result</h2>
            <ul className="mt-3 space-y-2">
              {match.notes.map((n) => (
                <li key={n} className="flex gap-2 text-[0.85rem] leading-relaxed text-ink/80">
                  <span className="mt-1 text-saffron">•</span>
                  <span>{n}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 rounded-lg bg-paper-deep/60 p-3 text-xs leading-relaxed text-muted">
              Guna Milan is a first filter, not a verdict. A score below 18 is not a prohibition, and a
              score above 32 does not guarantee harmony. Read the 7th house, Venus and Jupiter in both
              charts, compare the Navamsa (D9), and treat the kutas as one part of the judgement. This is
              guidance for study, not a substitute for professional or family counsel.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
