/**
 * Kundli orchestrator.
 *
 * Everything the UI needs is computed here, on the server, and serialised to
 * the client. The heavy astronomy is Swiss Ephemeris (see ephemeris.ts), the
 * conventions are those of Jagannatha Hora / Parashara's Light:
 *   - Lahiri (Chitrapaksha) ayanamsa
 *   - mean lunar node
 *   - whole-sign houses (bhava chalit optional)
 *   - 365.25-day dasha year
 *   - apparent geocentric positions
 */
import {
  NAKSHATRAS,
  PLANETS,
  RASHIS,
  VARGA_LIST,
  SIGN_LORD,
  type PlanetId,
  type VargaKey,
} from "./constants";
import { buildChart, type BirthInput, type Chart } from "./chart";
import { DEFAULT_OPTIONS, type ChartOptions } from "./options";
import { computeHouses, computeGrahas, bodyLongitude, norm360, swe } from "./ephemeris";
import { computePanchang, upagrahas, type Panchang } from "./panchang";
import {
  subPeriods,
  vimshottari,
  yoginiDasha,
  type DashaChainItem,
  type DashaNode,
} from "./dasha";
import { vargaSign } from "./vargas";
import { computeShadbala, computeVimshopaka, type ShadbalaRow, type VimshopakaRow } from "./strength";
import { computeAshtakavarga, type AshtakavargaResult } from "./ashtakavarga";
import { detectYogas, type YogaResult } from "./yogas";
import { interpret, type Interpretation } from "./interpret";

export * from "./constants";
export * from "./options";
export * from "./chart";
export * from "./ephemeris";
export * from "./panchang";
export * from "./dasha";
export * from "./vargas";
export * from "./strength";
export * from "./ashtakavarga";
export * from "./yogas";
export * from "./interpret";
export * from "./matching";

export interface VargaChart {
  key: VargaKey;
  name: string;
  divisions: number;
  lagnaSign: number;
  bySign: Record<number, PlanetId[]>;
  placements: { planet: PlanetId; sign: number; house: number }[];
}

export interface SadeSatiPeriod {
  phase: "Rising" | "Peak" | "Setting";
  sign: number;
  startJd: number;
  endJd: number;
}

export interface SadeSatiInfo {
  active: boolean;
  phase: SadeSatiPeriod["phase"] | null;
  saturnSign: number;
  natalMoonSign: number;
  nowJd: number;
  periods: SadeSatiPeriod[];
}

export interface TransitInfo {
  planet: PlanetId;
  lon: number;
  sign: number;
  house: number;
  nakshatra: string;
  pada: number;
  retrograde: boolean;
}

export interface KundliResult {
  chart: Chart;
  panchang: Panchang;
  dashas: {
    tree: DashaNode[];
    balanceYears: number;
    startLord: PlanetId;
    chain: DashaChainItem[];
    yogini: { name: string; lord: PlanetId; startJd: number; endJd: number }[];
  };
  vargas: VargaChart[];
  shadbala: ShadbalaRow[];
  vimshopaka: VimshopakaRow[];
  ashtakavarga: AshtakavargaResult;
  yogas: YogaResult[];
  interpretation: Interpretation;
  sadeSati: SadeSatiInfo;
  transits: TransitInfo[];
  upagrahas: ReturnType<typeof upagrahas>;
}

export function computeKundli(
  input: BirthInput,
  options: ChartOptions = DEFAULT_OPTIONS,
  now: Date = new Date(),
): KundliResult {
  const chart = buildChart(input, options);
  const panchang = computePanchang(chart.jd, input.lat, input.lon, input.tz, options.ayanamsa);

  // Gulika: the ascendant rising at the start of the Gulika kaal.
  chart.gulika = norm360(
    computeHouses(panchang.gulikaKaal.startJd, input.lat, input.lon, options.houseSystem, {
      ayanamsa: options.ayanamsa,
    }).ascendant,
  );

  const dasha = vimshottari(chart.jd, chart.grahas[1].lon, {
    daysPerYear: options.dashaYear,
    depth: 3,
  });
  const chain = deepChain(dasha.tree, todayJd(chart, now), options.dashaYear);

  const yogas = detectYogas(chart);
  const interpretation = interpret(chart, chain, yogas);
  const transits = computeTransits(chart, now, options);
  const sadeSati = computeSadeSati(chart, now, options);

  return {
    chart,
    panchang,
    dashas: {
      tree: dasha.tree,
      balanceYears: dasha.balanceYears,
      startLord: dasha.startLord,
      chain,
      yogini: yoginiDasha(chart.jd, chart.grahas[1].lon, options.dashaYear),
    },
    vargas: vargaCharts(chart),
    shadbala: computeShadbala(chart, panchang),
    vimshopaka: computeVimshopaka(chart),
    ashtakavarga: computeAshtakavarga(chart),
    yogas,
    interpretation,
    sadeSati,
    transits,
    upagrahas: upagrahas(chart.grahas[0].lon),
  };
}

/** JD for "now", but never before birth (a newborn's current dasha is the first one). */
function todayJd(chart: Chart, now: Date) {
  const jd = now.getTime() / 86400000 + 2440587.5;
  return Math.max(jd, chart.jd + 1 / 24);
}

/**
 * Follow the running period down five levels. Sub-periods are generated on the
 * fly so the serialised tree can stay small (three levels).
 */
function deepChain(tree: DashaNode[], jd: number, daysPerYear: number): DashaChainItem[] {
  const out: DashaChainItem[] = [];
  let nodes: DashaNode[] | undefined = tree;
  while (nodes) {
    const node: DashaNode | undefined = nodes.find((n) => jd >= n.startJd && jd < n.endJd);
    if (!node) break;
    out.push({ lord: node.lord, level: node.level, startJd: node.startJd, endJd: node.endJd });
    if (node.level >= 5) break;
    nodes = node.children ?? subPeriods(node, node.level + 1, node.level + 1, daysPerYear);
  }
  return out;
}

export function vargaCharts(chart: Chart): VargaChart[] {
  const lagnaSigns = new Map<VargaKey, number>();
  for (const v of VARGA_LIST) lagnaSigns.set(v.key, vargaSign(chart.lagna.lon, v.key));

  return VARGA_LIST.map((v) => {
    const lagnaSign = lagnaSigns.get(v.key)!;
    const bySign: Record<number, PlanetId[]> = {};
    for (let i = 0; i < 12; i++) bySign[i] = [];
    const placements = chart.grahas.map((g) => {
      const sign = g.vargas[v.key];
      bySign[sign].push(g.planet);
      return { planet: g.planet, sign, house: ((sign - lagnaSign + 12) % 12) + 1 };
    });
    return { key: v.key, name: v.name, divisions: v.divisions, lagnaSign, bySign, placements };
  });
}

export function computeTransits(chart: Chart, now: Date, options: ChartOptions): TransitInfo[] {
  const jd = now.getTime() / 86400000 + 2440587.5;
  const g = computeGrahas(jd, { ayanamsa: options.ayanamsa, trueNode: options.trueNode });
  return g.map((b) => {
    const sign = Math.floor(b.lon / 30);
    const within = b.lon % 30;
    const nakIndex = Math.floor(b.lon / (360 / 27)) % 27;
    return {
      planet: b.planet,
      lon: b.lon,
      sign,
      house: ((sign - chart.lagna.sign + 12) % 12) + 1,
      nakshatra: NAKSHATRAS[nakIndex].name,
      pada: Math.min(4, Math.floor((within % (360 / 27)) / (360 / 108)) + 1),
      retrograde: b.retrograde,
    };
  });
}

/**
 * Sade Sati = transiting Saturn in the 12th, 1st or 2nd sign from the natal Moon.
 * Boundaries are found by bisection on Saturn's sign ingress, so they are
 * accurate to the day despite the retrograde loops.
 */
export function computeSadeSati(chart: Chart, now: Date, options: ChartOptions): SadeSatiInfo {
  const moonSign = chart.grahas[1].sign;
  const jdNow = now.getTime() / 86400000 + 2440587.5;
  const signAt = (jd: number) =>
    Math.floor(bodyLongitude(jd, swe.constants.SE_SATURN, options.ayanamsa) / 30);
  const saturnSign = signAt(jdNow);

  const relative = (s: number) => ((s - moonSign + 12) % 12) + 1;
  const phaseOf = (s: number): SadeSatiPeriod["phase"] | null =>
    relative(s) === 12 ? "Rising" : relative(s) === 1 ? "Peak" : relative(s) === 2 ? "Setting" : null;

  // Find ingress instants by scanning five days at a time across a wide window.
  const step = 5;
  let start = jdNow - 40 * 365.25;
  // Make sure the window opens outside a Sade Sati, so the first listed period
  // has a real start rather than an artificial one at the scan boundary.
  for (let i = 0; i < 300 && phaseOf(signAt(start)); i++) start -= step * 2;
  let end = jdNow + 32 * 365.25;
  for (let i = 0; i < 300 && phaseOf(signAt(end)); i++) end += step * 2;
  const periods: SadeSatiPeriod[] = [];
  let prevSign = signAt(start);
  let segStart = start;
  for (let jd = start + step; jd <= end; jd += step) {
    const s = signAt(jd);
    if (s !== prevSign) {
      // bisect the ingress inside [jd - step, jd]
      let lo = jd - step;
      let hi = jd;
      for (let i = 0; i < 30; i++) {
        const mid = (lo + hi) / 2;
        if (signAt(mid) === prevSign) lo = mid;
        else hi = mid;
      }
      const boundary = (lo + hi) / 2;
      const phase = phaseOf(prevSign);
      if (phase) periods.push({ phase, sign: prevSign, startJd: segStart, endJd: boundary });
      prevSign = s;
      segStart = boundary;
    }
  }
  const lastPhase = phaseOf(prevSign);
  if (lastPhase) periods.push({ phase: lastPhase, sign: prevSign, startJd: segStart, endJd: end });

  const active = phaseOf(saturnSign);
  return {
    active: active !== null,
    phase: active,
    saturnSign,
    natalMoonSign: moonSign,
    nowJd: jdNow,
    periods: periods.filter((p) => p.endJd - p.startJd > 20).sort((a, b) => a.startJd - b.startJd),
  };
}

/* ------------------------------------------------------------------ */
/* Small helpers shared by the UI                                       */
/* ------------------------------------------------------------------ */

export const DIGNITY_COLOR: Record<string, string> = {
  Exalted: "text-emerald-600 dark:text-emerald-400",
  Moolatrikona: "text-emerald-600 dark:text-emerald-400",
  "Own Sign": "text-emerald-600 dark:text-emerald-400",
  "Great Friend": "text-lime-600 dark:text-lime-400",
  Friend: "text-teal-600 dark:text-teal-400",
  Neutral: "text-zinc-500",
  Enemy: "text-orange-600 dark:text-orange-400",
  Debilitated: "text-red-600 dark:text-red-400",
};

export const VERDICT_COLOR: Record<string, string> = {
  positive: "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  mixed: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200",
  negative: "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200",
};

export const signName = (s: number) => RASHIS[((s % 12) + 12) % 12].name;
export const signLord = (s: number) => SIGN_LORD[((s % 12) + 12) % 12];
export const planetName = (p: PlanetId) => PLANETS[p].name;
