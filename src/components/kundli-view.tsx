"use client";

import Link from "next/link";
import { useState } from "react";
import type { KundliResult } from "@/lib/astro";
import { PLANETS, RASHIS } from "@/lib/astro/constants";
import { dms, fmtJdDate, fmtJdTime, longDate, ordinal } from "@/lib/format";
import { ChartPair } from "./charts";
import { CurrentDasha, DashaTree, YoginiTable } from "./dasha-tree";
import {
  AshtakavargaPanel,
  InterpretationPanel,
  KeyFacts,
  PanchangPanel,
  PanchangSummary,
  PlanetLegend,
  PlanetTable,
  SadeSatiPanel,
  Section,
  ShadbalaPanel,
  TransitPanel,
  VargaTable,
  VimshopakaPanel,
  YogaGrid,
} from "./panels";
import { VargaExplorer } from "./varga-explorer";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "charts", label: "Charts & vargas" },
  { key: "dashas", label: "Dashas" },
  { key: "panchang", label: "Panchang" },
  { key: "strength", label: "Strength" },
  { key: "reading", label: "Yogas & reading" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function KundliView({ result, reportHref }: { result: KundliResult; reportHref: string }) {
  const [tab, setTab] = useState<TabKey>("overview");
  const { chart, panchang } = result;
  const retro = chart.grahas.filter((g) => g.retrograde).map((g) => g.planet);
  const combust = chart.grahas.filter((g) => g.combust).map((g) => g.planet);

  return (
    <div className="space-y-6">
      {/* ---------- profile header ---------- */}
      <div className="card overflow-hidden">
        <div className="border-b border-line bg-gradient-to-r from-brand-soft via-paper-deep to-paper px-5 py-5 sm:px-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Vedic birth chart</p>
              <h1 className="display mt-1 text-3xl font-semibold text-brand-dark sm:text-4xl">{chart.input.name}</h1>
              <p className="mt-2 text-sm text-muted">
                {longDate(chart.input.date)} · {chart.input.time} · {chart.input.place}
              </p>
              <p className="mt-1 text-xs text-muted">
                {chart.input.lat.toFixed(4)}° {chart.input.lat >= 0 ? "N" : "S"},{" "}
                {Math.abs(chart.input.lon).toFixed(4)}° {chart.input.lon >= 0 ? "E" : "W"} ·{" "}
                {chart.input.tz} · UTC {chart.utc.toISOString().slice(0, 16).replace("T", " ")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={reportHref} className="btn btn-ghost no-print !px-4 !py-2 text-sm">
                Printable report
              </Link>
              <Link href="/kundli" className="btn btn-primary no-print !px-4 !py-2 text-sm">
                New chart
              </Link>
            </div>
          </div>
        </div>
        <div className="px-5 py-4 sm:px-7">
          <KeyFacts result={result} />
        </div>
      </div>

      {/* ---------- tabs ---------- */}
      <div className="no-print sticky top-16 z-30 -mx-1 overflow-x-auto rounded-full border border-line bg-paper/90 px-1 py-1 backdrop-blur">
        <div className="flex min-w-max gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`rounded-full px-3.5 py-2 text-[0.8rem] font-medium transition-colors ${
                tab === t.key ? "bg-brand text-white" : "text-muted hover:bg-brand-soft hover:text-brand-dark"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "overview" && (
        <div className="space-y-8">
          <Section
            eyebrow="Rashi chart"
            title="Lagna and planetary placement"
            description="North Indian (fixed houses) and South Indian (fixed signs) renderings of the D1 chart. The lagna is marked in both."
          >
            <div className="card p-4 sm:p-6">
              <ChartPair
                bySign={chart.bySign}
                lagnaSign={chart.lagna.sign}
                title="D1 · Rashi"
                subtitle="Sidereal, Lahiri ayanamsa"
                retrograde={retro}
                combust={combust}
              />
              <div className="mt-4 border-t border-line pt-3">
                <PlanetLegend />
              </div>
            </div>
          </Section>

          <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
            <Section eyebrow="Panchang at birth" title="The five limbs of the day" description="Tithi, nakshatra, yoga, karana and the solar day at the birth place.">
              <div className="card space-y-4 p-4 sm:p-5">
                <PanchangSummary panchang={panchang} tz={chart.input.tz} />
                <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <MiniStat label="Sunrise" value={fmtJdTime(panchang.sunriseJd, chart.input.tz)} />
                  <MiniStat label="Sunset" value={fmtJdTime(panchang.sunsetJd, chart.input.tz)} />
                  <MiniStat label="Lunar month" value={panchang.lunarMonth.purnimantaName} />
                  <MiniStat label="Vikram samvat" value={String(panchang.samvat.vikram)} />
                </div>
              </div>
            </Section>

            <Section eyebrow="Timing" title="Where you are now" description="The running Vimshottari chain and the 7½-year Saturn transit.">
              <div className="space-y-4">
                <div className="card p-4">
                  <h3 className="mb-3 text-sm font-semibold text-brand-dark">Current dasha</h3>
                  <CurrentDasha chain={result.dashas.chain} tz={chart.input.tz} />
                </div>
                <div className="card p-4">
                  <h3 className="mb-3 text-sm font-semibold text-brand-dark">Sade Sati</h3>
                  <SadeSatiPanel info={result.sadeSati} tz={chart.input.tz} />
                </div>
              </div>
            </Section>
          </div>

          <Section
            eyebrow="Grahas"
            title="Planetary positions"
            description="Sidereal longitude, bhava, nakshatra, dignity and the KP star/sub/sub-sub lords."
            actions={<Link href={reportHref} className="chip no-print">Full report →</Link>}
          >
            <div className="card p-4 sm:p-5">
              <PlanetTable chart={chart} />
            </div>
          </Section>

          <Section eyebrow="Highlights" title="Yogas in this chart" description="The named combinations detected with strict classical rules.">
            <YogaGrid yogas={result.yogas.slice(0, 6)} />
          </Section>
        </div>
      )}

      {tab === "charts" && (
        <div className="space-y-8">
          <Section
            eyebrow="D1"
            title="Rashi chart"
            description="The primary chart, read with the Moon (mind) and the lagna (body and direction)."
          >
            <div className="card p-4 sm:p-6">
              <ChartPair
                bySign={chart.bySign}
                lagnaSign={chart.lagna.sign}
                title="D1 · Rashi"
                subtitle="Sidereal, Lahiri ayanamsa"
                retrograde={retro}
                combust={combust}
              />
              <div className="mt-4 border-t border-line pt-3">
                <PlanetLegend />
              </div>
            </div>
          </Section>

          <Section
            eyebrow="Divisional charts"
            title="Vargas D2–D60"
            description="Sixteen Parashari divisional charts. Select a varga to see its chart, placements and meaning."
          >
            <VargaExplorer result={result} />
          </Section>

          <Section eyebrow="Reference" title="Varga sign table" description="Every planet's varga sign at a glance.">
            <div className="card p-4">
              <VargaTable result={result} />
            </div>
          </Section>
        </div>
      )}

      {tab === "dashas" && (
        <div className="space-y-8">
          <Section
            eyebrow="Vimshottari"
            title="Current dasha chain"
            description="Five levels of the 120-year cycle, computed from the Moon's nakshatra position with a 365.25-day year."
          >
            <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
              <div className="card p-4">
                <CurrentDasha chain={result.dashas.chain} tz={chart.input.tz} />
                <div className="mt-4 rounded-lg bg-paper-deep/60 p-3 text-xs text-muted">
                  Balance at birth: <strong className="text-ink">{result.dashas.balanceYears.toFixed(3)} years</strong> of{" "}
                  {PLANETS[result.dashas.startLord].name} dasha.
                </div>
              </div>
              <div className="card p-4">
                <h3 className="mb-3 text-sm font-semibold text-brand-dark">How to read it</h3>
                <p className="text-sm leading-relaxed text-muted">
                  The maha-dasha sets the decade's theme, the antar-dasha narrows it to a few years, and the
                  pratyantar times events within that. A planet gives the results of the house it occupies,
                  the houses it rules, and the planets it aspects — modified by its dignity and the divisional charts.
                </p>
              </div>
            </div>
          </Section>

          <Section eyebrow="Tree" title="Mahadasha, antardasha and pratyantar" description="Click any period to open its sub-periods. The running chain is highlighted.">
            <div className="card p-4 sm:p-5">
              <DashaTree tree={result.dashas.tree} tz={chart.input.tz} chain={result.dashas.chain} />
            </div>
          </Section>

          <Section eyebrow="Yogini" title="Yogini dasha" description="A parallel 36-year nakshatra-based cycle often used for timing.">
            <div className="card p-4">
              <YoginiTable periods={result.dashas.yogini} tz={chart.input.tz} />
            </div>
          </Section>
        </div>
      )}

      {tab === "panchang" && (
        <div className="space-y-8">
          <Section
            eyebrow="Panchang"
            title={`Panchang for ${chart.input.place}`}
            description={`${longDate(chart.input.date)} · sunrise-to-sunrise Vedic day · times in ${chart.input.tz}`}
          >
            <PanchangPanel
              panchang={panchang}
              tz={chart.input.tz}
              place={chart.input.place}
              dateLabel={chart.input.date}
              upagrahas={result.upagrahas}
            />
          </Section>

          <Section eyebrow="Grahas" title="Birth chart positions" description="The same moment, read as a chart.">
            <div className="card p-4">
              <PlanetTable chart={chart} compact />
            </div>
          </Section>
        </div>
      )}

      {tab === "strength" && (
        <div className="space-y-8">
          <Section
            eyebrow="Shadbala"
            title="Six-fold planetary strength"
            description="Sthana, dig, kala, cheshta, naisargika and drik bala in virupas; 60 virupas = 1 rupa. The ratio compares the result with the classical minimum."
          >
            <div className="card p-4">
              <ShadbalaPanel rows={result.shadbala} />
            </div>
          </Section>

          <Section eyebrow="Vimshopaka" title="Vimshopaka bala" description="Weighted dignity across the shadvarga, scored out of 20.">
            <div className="card p-4">
              <VimshopakaPanel rows={result.vimshopaka} />
            </div>
          </Section>

          <Section
            eyebrow="Ashtakavarga"
            title="Bhinnashtakavarga & Sarvashtakavarga"
            description="Benefic bindus contributed by each planet and the lagna. These show which signs (and therefore houses) are supported."
          >
            <div className="card p-4">
              <AshtakavargaPanel av={result.ashtakavarga} />
            </div>
          </Section>
        </div>
      )}

      {tab === "reading" && (
        <div className="space-y-8">
          <Section eyebrow="Yogas" title="Combinations present" description="Supportive, mixed and challenging classical yogas, with the exact rule that formed each one.">
            <YogaGrid yogas={result.yogas} />
          </Section>

          <Section eyebrow="Interpretation" title="A house-by-house reading" description="Generated from the chart's own placements — lagna, bhavas, grahas and the running dasha.">
            <InterpretationPanel reading={result.interpretation} />
          </Section>

          <div className="grid gap-8 lg:grid-cols-2">
            <Section eyebrow="Saturn transit" title="Sade Sati" description="The 7½-year Saturn cycle around the natal Moon.">
              <div className="card p-4">
                <SadeSatiPanel info={result.sadeSati} tz={chart.input.tz} />
              </div>
            </Section>
            <Section eyebrow="Gochara" title="Current transits" description="Where the grahas are today, and the houses they occupy from your lagna.">
              <div className="card p-4">
                <TransitPanel transits={result.transits} tz={chart.input.tz} />
              </div>
            </Section>
          </div>

          <Section eyebrow="Remedies" title="Traditional upaya" description="Only for planets that are weak, combust or in an enemy sign. These are customary remedies, not medical or financial advice.">
            <div className="card p-4">
              <InterpretationPanel reading={{ ...result.interpretation, houses: [], planets: [] }} />
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-paper-deep/40 px-3 py-2">
      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}
