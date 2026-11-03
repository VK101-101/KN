import { PLANETS, RASHIS, type PlanetId } from "@/lib/astro/constants";
import type { Chart } from "@/lib/astro/chart";
import type { Panchang, PanchangSlot } from "@/lib/astro/panchang";
import type { KundliResult } from "@/lib/astro";
import { dms, fmtJdDate, fmtJdTime, ordinal } from "@/lib/format";

const DIGNITY_COLOR: Record<string, string> = {
  Exalted: "text-emerald-600",
  Moolatrikona: "text-emerald-600",
  "Own Sign": "text-emerald-600",
  "Great Friend": "text-lime-600",
  Friend: "text-teal-600",
  Neutral: "text-zinc-500",
  Enemy: "text-orange-600",
  Debilitated: "text-red-600",
};

/* ------------------------------------------------------------------ */
/* Layout primitives                                                   */
/* ------------------------------------------------------------------ */

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  actions,
  className = "",
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`scroll-mt-24 ${className}`}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 className="section-title mt-1">{title}</h2>
          {description && <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`card p-4 sm:p-5 ${className}`}>{children}</div>;
}

export function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "good" | "bad" | "brand" }) {
  const tones = {
    neutral: "border-line bg-paper-deep text-muted",
    good: "border-emerald-200 bg-emerald-50 text-emerald-800",
    bad: "border-rose-200 bg-rose-50 text-rose-800",
    brand: "border-brand/20 bg-brand-soft text-brand-dark",
  };
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[0.68rem] font-medium ${tones[tone]}`}>{children}</span>;
}

/* ------------------------------------------------------------------ */
/* Planets                                                             */
/* ------------------------------------------------------------------ */

export function PlanetTable({ chart, compact = false }: { chart: Chart; compact?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Graha</th>
            <th>Rashi</th>
            <th>Degree</th>
            <th>Bhava</th>
            <th>Nakshatra</th>
            <th>Dignity</th>
            {!compact && <th>KP star / sub / sub-sub</th>}
            <th>State</th>
          </tr>
        </thead>
        <tbody>
          {chart.grahas.map((g) => (
            <tr key={g.planet}>
              <td>
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: PLANETS[g.planet].color }}
                  />
                  <span className="font-semibold text-ink">{PLANETS[g.planet].name}</span>
                  <span className="text-[0.7rem] text-muted">{PLANETS[g.planet].sanskrit}</span>
                </span>
              </td>
              <td>
                {RASHIS[g.sign].name}
                <span className="ml-1 text-[0.7rem] text-muted">{RASHIS[g.sign].hi}</span>
              </td>
              <td className="font-mono text-[0.78rem]">{dms(g.degInSign)}</td>
              <td>{ordinal(g.house)}</td>
              <td>
                {g.nakshatra} <span className="text-muted">p{g.pada}</span>
              </td>
              <td className={DIGNITY_COLOR[g.dignity]}>{g.dignity}</td>
              {!compact && (
                <td className="text-[0.78rem]">
                  {PLANETS[g.kp.star].name.slice(0, 2)} / {PLANETS[g.kp.sub].name.slice(0, 2)} /{" "}
                  {PLANETS[g.kp.subSub].name.slice(0, 2)}
                </td>
              )}
              <td>
                <span className="flex flex-wrap gap-1">
                  {g.retrograde && <Pill tone="bad">R</Pill>}
                  {g.combust && <Pill tone="bad">Combust</Pill>}
                  {!g.retrograde && !g.combust && <span className="text-muted">—</span>}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Panchang                                                            */
/* ------------------------------------------------------------------ */

function TimeRange({ slot, tz }: { slot: PanchangSlot; tz: string }) {
  return (
    <span className="font-mono text-[0.72rem] text-muted">
      {fmtJdTime(slot.startJd, tz)} – {fmtJdTime(slot.endJd, tz)}
    </span>
  );
}

const QUALITY_DOT = {
  good: "bg-emerald-500",
  bad: "bg-rose-500",
  neutral: "bg-amber-400",
};

export function PanchangSummary({ panchang, tz }: { panchang: Panchang; tz: string }) {
  const items = [
    { label: "Tithi", value: panchang.tithi.fullName, end: panchang.tithi.endJd },
    { label: "Nakshatra", value: `${panchang.nakshatra.name} p${panchang.nakshatra.pada}`, end: panchang.nakshatra.endJd },
    { label: "Yoga", value: panchang.yoga.name, end: panchang.yoga.endJd },
    { label: "Karana", value: panchang.karana.name, end: panchang.karana.endJd },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it) => (
        <div key={it.label} className="rounded-xl border border-line bg-paper-deep/40 p-3">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-muted">{it.label}</p>
          <p className="mt-0.5 text-sm font-semibold text-ink">{it.value}</p>
          <p className="text-[0.7rem] text-muted">until {fmtJdTime(it.end, tz)}</p>
        </div>
      ))}
    </div>
  );
}

export function PanchangPanel({
  panchang,
  tz,
  place,
  dateLabel,
  upagrahas,
}: {
  panchang: Panchang;
  tz: string;
  place: string;
  dateLabel?: string;
  upagrahas?: Record<string, number>;
}) {
  return (
    <div className="space-y-5">
      <PanchangSummary panchang={panchang} tz={tz} />

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel>
          <h3 className="text-sm font-semibold text-brand-dark">The day</h3>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
            <Row label="Weekday" value={panchang.weekdayName} />
            <Row label="Place" value={place} />
            {dateLabel && <Row label="Date" value={dateLabel} />}
            <Row label="Sunrise" value={fmtJdTime(panchang.sunriseJd, tz)} />
            <Row label="Sunset" value={fmtJdTime(panchang.sunsetJd, tz)} />
            <Row label="Day length" value={`${panchang.dayLengthHours.toFixed(2)} h`} />
            <Row label="Night length" value={`${panchang.nightLengthHours.toFixed(2)} h`} />
            <Row label="Moon rashi" value={RASHIS[panchang.moonSign].name} />
            <Row label="Sun rashi" value={RASHIS[panchang.sunSign].name} />
          </dl>
        </Panel>

        <Panel>
          <h3 className="text-sm font-semibold text-brand-dark">Vedic calendar</h3>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
            <Row label="Lunar month" value={panchang.lunarMonth.purnimantaName} />
            <Row label="Amanta month" value={panchang.lunarMonth.name} />
            <Row label="Vikram samvat" value={String(panchang.samvat.vikram)} />
            <Row label="Shaka samvat" value={String(panchang.samvat.shaka)} />
            <Row label="Samvatsara" value={panchang.samvat.samvatsara} />
            <Row label="Ritu" value={panchang.ritu} />
            <Row label="Ayana" value={panchang.ayana} />
            <Row label="Paksha" value={panchang.tithi.paksha} />
          </dl>
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel>
          <h3 className="text-sm font-semibold text-brand-dark">Choghadiya</h3>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { title: "Day", slots: panchang.choghadiyaDay },
              { title: "Night", slots: panchang.choghadiyaNight },
            ].map((group) => (
              <div key={group.title}>
                <p className="mb-2 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-muted">{group.title}</p>
                <ul className="space-y-1">
                  {group.slots.map((s, i) => (
                    <li key={i} className="flex items-center justify-between gap-2 rounded-lg px-1.5 py-1 text-[0.78rem]">
                      <span className="flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 rounded-full ${QUALITY_DOT[s.quality ?? "neutral"]}`} />
                        {s.name}
                      </span>
                      <TimeRange slot={s} tz={tz} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel>
            <h3 className="text-sm font-semibold text-brand-dark">Muhurat & caution</h3>
            <div className="mt-3 space-y-2">
              {[panchang.abhijit, panchang.rahuKaal, panchang.yamaganda, panchang.gulikaKaal].map((s) => (
                <div key={s.name} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${QUALITY_DOT[s.quality ?? "neutral"]}`} />
                    {s.name}
                  </span>
                  <TimeRange slot={s} tz={tz} />
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <h3 className="text-sm font-semibold text-brand-dark">Upagrahas</h3>
            <div className="mt-3 grid grid-cols-1 gap-2 text-[0.8rem] sm:grid-cols-2">
              {upagrahas
                ? Object.entries(upagrahas).map(([key, lon]) => (
                    <div key={key} className="flex items-center justify-between gap-2">
                      <span className="text-muted">{panchangUpagrahaLabels[key] ?? key}</span>
                      <span className="font-medium">
                        {RASHIS[Math.floor(lon / 30)].name} {dms(lon % 30)}
                      </span>
                    </div>
                  ))
                : ["dhuma", "vyatipata", "parivesha", "indrachapa", "upaketu"].map((key) => (
                    <div key={key} className="flex items-center justify-between gap-2">
                      <span className="text-muted">{panchangUpagrahaLabels[key]}</span>
                      <span className="text-muted">—</span>
                    </div>
                  ))}
            </div>
          </Panel>
        </div>
      </div>

      <Panel>
        <h3 className="text-sm font-semibold text-brand-dark">Horas</h3>
        <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-6">
          {panchang.horas.map((h, i) => (
            <div key={i} className="rounded-lg border border-line bg-white/70 px-2 py-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[0.72rem] font-semibold text-ink">{h.name}</span>
                {i === 11 && <span className="text-[0.55rem] uppercase text-muted">sunset</span>}
              </div>
              <TimeRange slot={h} tz={tz} />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

const panchangUpagrahaLabels: Record<string, string> = {
  dhuma: "Dhuma",
  vyatipata: "Vyatipata",
  parivesha: "Parivesha",
  indrachapa: "Indrachapa",
  upaketu: "Upaketu",
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium text-ink sm:text-left">{value}</dd>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Strengths                                                           */
/* ------------------------------------------------------------------ */

export function ShadbalaPanel({ rows }: { rows: KundliResult["shadbala"] }) {
  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Graha</th>
            <th>Sthana</th>
            <th>Dig</th>
            <th>Kala</th>
            <th>Cheshta</th>
            <th>Naisargika</th>
            <th>Drik</th>
            <th>Total</th>
            <th>Rupas</th>
            <th>Required</th>
            <th>Ratio</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.planet}>
              <td className="font-semibold">{PLANETS[r.planet].name}</td>
              <td>{r.sthana.toFixed(0)}</td>
              <td>{r.dig.toFixed(0)}</td>
              <td>{r.kala.toFixed(0)}</td>
              <td>{r.cheshta.toFixed(0)}</td>
              <td>{r.naisargika.toFixed(0)}</td>
              <td className={r.drik >= 0 ? "text-emerald-700" : "text-rose-700"}>{r.drik.toFixed(0)}</td>
              <td className="font-medium">{r.total.toFixed(0)}</td>
              <td className="font-semibold">{r.rupas.toFixed(2)}</td>
              <td>{r.required}</td>
              <td>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-14 overflow-hidden rounded-full bg-paper-deep">
                    <div
                      className={`h-full rounded-full ${r.ratio >= 1 ? "bg-emerald-500" : r.ratio >= 0.8 ? "bg-amber-400" : "bg-rose-400"}`}
                      style={{ width: `${Math.min(100, r.ratio * 100)}%` }}
                    />
                  </div>
                  <span className={r.ratio >= 1 ? "text-emerald-700" : r.ratio >= 0.8 ? "text-amber-700" : "text-rose-700"}>
                    {r.ratio.toFixed(2)}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function VimshopakaPanel({ rows }: { rows: KundliResult["vimshopaka"] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {rows.map((r) => (
        <div key={r.planet} className="flex items-center gap-3 rounded-lg border border-line px-3 py-2">
          <span className="w-16 text-sm font-medium">{PLANETS[r.planet].name}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper-deep">
            <div className="h-full rounded-full bg-brand" style={{ width: `${r.percent}%` }} />
          </div>
          <span className="w-14 text-right text-xs text-muted">
            {r.score.toFixed(1)} / 20
          </span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Ashtakavarga                                                        */
/* ------------------------------------------------------------------ */

const SIGN_SHORT = ["Ar", "Ta", "Ge", "Cn", "Le", "Vi", "Li", "Sc", "Sg", "Cp", "Aq", "Pi"];

export function AshtakavargaPanel({ av }: { av: KundliResult["ashtakavarga"] }) {
  const rows = [0, 1, 2, 3, 4, 5, 6];
  return (
    <div className="overflow-x-auto">
      <table className="data-table text-center">
        <thead>
          <tr>
            <th className="text-left">Graha</th>
            {SIGN_SHORT.map((s, i) => (
              <th key={s} className="text-center">
                {s}
                <span className="block font-normal normal-case tracking-normal text-[0.58rem]">{RASHIS[i].name}</span>
              </th>
            ))}
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p}>
              <td className={`text-left font-semibold ${p === 0 ? "text-orange-700" : p === 6 ? "text-blue-700" : ""}`}>
                {PLANETS[p].name}
              </td>
              {av.bhinnashtakavarga[p].map((v, i) => (
                <td key={i} className={v >= 5 ? "font-semibold text-emerald-700" : v <= 2 ? "text-rose-600" : ""}>
                  {v}
                </td>
              ))}
              <td className="font-semibold">{av.totals[p]}</td>
            </tr>
          ))}
          <tr className="bg-brand-soft/60">
            <td className="text-left font-bold text-brand-dark">Sarva</td>
            {av.sarvashtakavarga.map((v, i) => (
              <td key={i} className={`font-bold ${v >= 30 ? "text-emerald-700" : v <= 25 ? "text-rose-600" : ""}`}>
                {v}
              </td>
            ))}
            <td className="font-bold">{av.sarvashtakavarga.reduce((a, b) => a + b, 0)}</td>
          </tr>
        </tbody>
      </table>
      <p className="mt-2 text-xs text-muted">
        Bhinnashtakavarga bindus per sign (max 8). Sarvashtakavarga totals 337; signs with 30+ bindus
        support their house matters, signs under 25 need effort.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Yogas, reading, sade sati, transits                                 */
/* ------------------------------------------------------------------ */

const POLARITY_STYLE = {
  positive: "border-emerald-200 bg-emerald-50/70",
  mixed: "border-amber-200 bg-amber-50/70",
  negative: "border-rose-200 bg-rose-50/70",
} as const;

const POLARITY_LABEL = { positive: "Supportive", mixed: "Mixed", negative: "Challenging" } as const;

export function YogaGrid({ yogas }: { yogas: KundliResult["yogas"] }) {
  if (!yogas.length) {
    return <p className="text-sm text-muted">No named classical yoga was detected with the strict rules used here. Absence of a yoga is not a defect — the chart is still read from its houses and dashas.</p>;
  }
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {yogas.map((y) => (
        <div key={y.key} className={`rounded-xl border p-4 ${POLARITY_STYLE[y.polarity]}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-ink">{y.name}</h3>
              <p className="text-[0.68rem] uppercase tracking-[0.1em] text-muted">{y.category}</p>
            </div>
            <span className="chip !bg-white/70">{POLARITY_LABEL[y.polarity]}</span>
          </div>
          <p className="mt-2 text-[0.8rem] leading-relaxed text-ink/80">{y.formedBy}</p>
          <p className="mt-2 text-[0.82rem] leading-relaxed text-muted">{y.description}</p>
        </div>
      ))}
    </div>
  );
}

export function InterpretationPanel({ reading }: { reading: KundliResult["interpretation"] }) {
  return (
    <div className="space-y-5">
      <Panel>
        <h3 className="text-sm font-semibold text-brand-dark">Lagna & temperament</h3>
        <p className="prose-astro mt-2 text-sm leading-relaxed text-ink/85">{reading.lagna}</p>
        <p className="prose-astro mt-3 text-sm leading-relaxed text-ink/85">{reading.nakshatra}</p>
        <p className="prose-astro mt-3 text-sm leading-relaxed text-ink/85">{reading.currentDasha}</p>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel>
          <h3 className="text-sm font-semibold text-brand-dark">The twelve bhavas</h3>
          <div className="mt-3 space-y-3">
            {reading.houses.map((h) => (
              <div key={h.house} className="border-b border-line/70 pb-3 last:border-0 last:pb-0">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-saffron">{ordinal(h.house)} house</p>
                <p className="mt-1 text-[0.83rem] leading-relaxed text-ink/80">{h.text}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <h3 className="text-sm font-semibold text-brand-dark">Grahas in the chart</h3>
          <div className="mt-3 space-y-3">
            {reading.planets.map((p) => (
              <div key={p.planet} className="border-b border-line/70 pb-3 last:border-0 last:pb-0">
                <p className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-saffron">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: PLANETS[p.planet].color }} />
                  {PLANETS[p.planet].name}
                </p>
                <p className="mt-1 text-[0.83rem] leading-relaxed text-ink/80">{p.text}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {reading.remedies.length > 0 && (
        <Panel>
          <h3 className="text-sm font-semibold text-brand-dark">Suggested remedies</h3>
          <p className="mt-1 text-xs text-muted">
            Traditional upaya for planets that are weak, combust or in an enemy sign. Choose one or two, not all.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {reading.remedies.map((r) => (
              <div key={r.planet} className="rounded-xl border border-line bg-paper-deep/40 p-3">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: PLANETS[r.planet].color }} />
                  {PLANETS[r.planet].name}
                </p>
                <p className="mt-1 text-[0.72rem] text-muted">{r.reason}</p>
                <dl className="mt-2 space-y-1 text-[0.78rem]">
                  <div className="flex justify-between gap-2"><dt className="text-muted">Gem</dt><dd className="text-right">{r.gem}</dd></div>
                  <div className="flex justify-between gap-2"><dt className="text-muted">Mantra</dt><dd className="text-right">{r.mantra}</dd></div>
                  <div className="flex justify-between gap-2"><dt className="text-muted">Day</dt><dd className="text-right">{r.day}</dd></div>
                  <div className="flex justify-between gap-2"><dt className="text-muted">Charity</dt><dd className="max-w-[70%] text-right">{r.charity}</dd></div>
                  <div className="flex justify-between gap-2"><dt className="text-muted">Deity</dt><dd className="text-right">{r.deity}</dd></div>
                </dl>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}

export function SadeSatiPanel({ info, tz }: { info: KundliResult["sadeSati"]; tz: string }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className={`chip ${info.active ? "!border-amber-300 !bg-amber-50 !text-amber-900" : "!border-emerald-200 !bg-emerald-50 !text-emerald-800"}`}>
          {info.active ? `Active — ${info.phase} phase` : "Not active"}
        </span>
        <span className="text-sm text-muted">
          Saturn transits {RASHIS[info.saturnSign].name}; natal Moon is in {RASHIS[info.natalMoonSign].name}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Phase</th>
              <th>Saturn transit sign</th>
              <th>From</th>
              <th>To</th>
            </tr>
          </thead>
          <tbody>
            {info.periods.slice(0, 10).map((p, i) => (
              <tr key={i}>
                <td className="font-medium">{p.phase}</td>
                <td>{RASHIS[p.sign].name}</td>
                <td>{fmtJdDate(p.startJd, tz)}</td>
                <td>{fmtJdDate(p.endJd, tz)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs leading-relaxed text-muted">
        Sade Sati is the 7½-year transit of Saturn through the 12th, 1st and 2nd signs from the natal
        Moon. It is a period of restructuring, not a sentence — its effect follows the strength of the
        natal Saturn and the Moon.
      </p>
    </div>
  );
}

export function TransitPanel({ transits, tz }: { transits: KundliResult["transits"]; tz: string }) {
  void tz;
  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Graha</th>
            <th>Transit rashi</th>
            <th>Degree</th>
            <th>From lagna</th>
            <th>Nakshatra</th>
          </tr>
        </thead>
        <tbody>
          {transits.map((t) => (
            <tr key={t.planet}>
              <td className="font-semibold">{PLANETS[t.planet].name}</td>
              <td>{RASHIS[t.sign].name}</td>
              <td className="font-mono text-[0.78rem]">{dms(t.lon % 30)}</td>
              <td>{ordinal(t.house)}</td>
              <td>
                {t.nakshatra} <span className="text-muted">p{t.pada}</span>
                {t.retrograde && <span className="ml-1 text-rose-600">R</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Varga table                                                         */
/* ------------------------------------------------------------------ */

export function VargaTable({ result }: { result: KundliResult }) {
  const keys = result.vargas.map((v) => v.key);
  return (
    <div className="overflow-x-auto">
      <table className="data-table text-center">
        <thead>
          <tr>
            <th className="text-left">Varga</th>
            {result.chart.grahas.map((g) => (
              <th key={g.planet} className="text-center">{PLANETS[g.planet].short}</th>
            ))}
            <th>Lagna</th>
          </tr>
        </thead>
        <tbody>
          {result.vargas.map((v) => (
            <tr key={v.key}>
              <td className="text-left">
                <span className="font-semibold">{v.key}</span>{" "}
                <span className="text-muted">{v.name}</span>
              </td>
              {result.chart.grahas.map((g) => {
                const p = v.placements.find((x) => x.planet === g.planet)!;
                return (
                  <td key={g.planet} className={p.house === 1 || [5, 9].includes(p.house) ? "font-semibold text-brand" : ""}>
                    {RASHIS[p.sign].name.slice(0, 3)}
                  </td>
                );
              })}
              <td>{RASHIS[v.lagnaSign].name.slice(0, 3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-muted">
        {keys.length} divisional charts (D1–D60) using the BPHS Parashari mappings.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Misc                                                                */
/* ------------------------------------------------------------------ */

export function KeyFacts({ result }: { result: KundliResult }) {
  const { chart, panchang } = result;
  const moon = chart.grahas[1];
  const current = result.dashas.chain[0];
  const facts = [
    { label: "Lagna", value: `${RASHIS[chart.lagna.sign].name} ${dms(chart.lagna.degInSign)}`, sub: `${chart.lagna.nakshatra} p${chart.lagna.pada}` },
    { label: "Rashi (Moon)", value: `${RASHIS[moon.sign].name}`, sub: `${moon.nakshatra} p${moon.pada}` },
    { label: "Nakshatra lord", value: PLANETS[moon.nakshatraLord].name, sub: `Moon at ${dms(moon.degInSign)}` },
    { label: "Current dasha", value: current ? PLANETS[current.lord].name : "—", sub: current ? `${["Maha", "Antar", "Pratyantar", "Sookshma", "Prana"][current.level - 1]} dasha` : "" },
    { label: "Tithi", value: panchang.tithi.fullName, sub: `${panchang.weekdayName} · ${panchang.nakshatra.name}` },
    { label: "Ayanamsa", value: `${chart.ayanamsa.toFixed(4)}°`, sub: "Lahiri / Chitrapaksha" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {facts.map((f) => (
        <div key={f.label} className="rounded-xl border border-line bg-card p-3">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-muted">{f.label}</p>
          <p className="mt-1 text-[0.92rem] font-semibold leading-tight text-ink">{f.value}</p>
          <p className="mt-0.5 text-[0.66rem] text-muted">{f.sub}</p>
        </div>
      ))}
    </div>
  );
}

export function PlanetLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[0.7rem] text-muted">
      {PLANETS.map((p) => (
        <span key={p.id} className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.color }} />
          {p.short} = {p.name}
        </span>
      ))}
      <span>R = retrograde</span>
      <span>* = combust</span>
    </div>
  );
}

export function planetColor(p: PlanetId) {
  return PLANETS[p].color;
}
