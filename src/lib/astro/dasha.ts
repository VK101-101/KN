import { DASHA_ORDER, NAKSHATRAS, NAKSHATRA_SPAN, PLANETS, type PlanetId } from "./constants";

export interface DashaNode {
  lord: PlanetId;
  level: number;
  startJd: number;
  endJd: number;
  children?: DashaNode[];
}

export interface DashaOptions {
  /** Days in a dasha year: 365.25 (JHora / Parashara's Light default) or 360 (savana) */
  daysPerYear?: number;
  depth?: number;
}

const YEAR_365 = 365.25;

export function vimshottari(
  jdBirth: number,
  moonLon: number,
  opts: DashaOptions = {},
): { tree: DashaNode[]; balanceYears: number; startLord: PlanetId; nakIndex: number } {
  const daysPerYear = opts.daysPerYear ?? YEAR_365;
  const depth = opts.depth ?? 3;

  const lon = ((moonLon % 360) + 360) % 360;
  const nakIndex = Math.floor(lon / NAKSHATRA_SPAN) % 27;
  const startLord = NAKSHATRAS[nakIndex].lord as PlanetId;
  const fraction = (lon % NAKSHATRA_SPAN) / NAKSHATRA_SPAN;
  const balanceYears = PLANETS[startLord].years * (1 - fraction);

  const startIdx = DASHA_ORDER.indexOf(startLord);
  const cursor = jdBirth - fraction * PLANETS[startLord].years * daysPerYear;

  const tree: DashaNode[] = [];
  let jd = cursor;
  for (let i = 0; i < 9; i++) {
    const lord = DASHA_ORDER[(startIdx + i) % 9];
    const span = PLANETS[lord].years * daysPerYear;
    const node: DashaNode = { lord, level: 1, startJd: jd, endJd: jd + span };
    if (depth > 1) node.children = subPeriods(node, 2, depth, daysPerYear);
    tree.push(node);
    jd += span;
  }

  return { tree, balanceYears, startLord, nakIndex };
}

export function subPeriods(parent: DashaNode, level: number, maxDepth: number, daysPerYear: number): DashaNode[] {
  const total = parent.endJd - parent.startJd;
  const startIdx = DASHA_ORDER.indexOf(parent.lord);
  const out: DashaNode[] = [];
  let jd = parent.startJd;
  for (let i = 0; i < 9; i++) {
    const lord = DASHA_ORDER[(startIdx + i) % 9];
    const span = (total * PLANETS[lord].years) / 120;
    const node: DashaNode = { lord, level, startJd: jd, endJd: jd + span };
    if (level < maxDepth) node.children = subPeriods(node, level + 1, maxDepth, daysPerYear);
    out.push(node);
    jd += span;
  }
  return out;
}

/** Expand the tree further, one level at a time (for "show pratyantar" clicks). */
export function expandNode(node: DashaNode, targetLevel: number, daysPerYear = YEAR_365): DashaNode {
  if (node.level >= targetLevel) return node;
  if (!node.children) node.children = subPeriods(node, node.level + 1, targetLevel, daysPerYear);
  else if (node.children.length && node.children[0].level < targetLevel) {
    node.children = node.children.map((c) => expandNode(c, targetLevel, daysPerYear));
  }
  return node;
}

export interface DashaChainItem {
  lord: PlanetId;
  level: number;
  startJd: number;
  endJd: number;
}

export function currentDashaChain(tree: DashaNode[], jd: number): DashaChainItem[] {
  const chain: DashaChainItem[] = [];
  let list: DashaNode[] | undefined = tree;
  while (list) {
    const node: DashaNode | undefined = list.find((n) => jd >= n.startJd && jd < n.endJd);
    if (!node) break;
    chain.push({ lord: node.lord, level: node.level, startJd: node.startJd, endJd: node.endJd });
    list = node.children;
  }
  return chain;
}

export const DASHA_LEVEL_NAMES = ["Maha Dasha", "Antar Dasha", "Pratyantar Dasha", "Sookshma Dasha", "Prana Dasha", "Deha Dasha"];

/* ------------------------------------------------------------------ */
/* Yogini Dasha (36 years, JHora / AstroSage)                          */
/* ------------------------------------------------------------------ */

export const YOGINIS = [
  { name: "Mangala", lord: 1 as PlanetId, years: 1 },
  { name: "Pingala", lord: 0 as PlanetId, years: 2 },
  { name: "Dhanya", lord: 4 as PlanetId, years: 3 },
  { name: "Bhramari", lord: 2 as PlanetId, years: 4 },
  { name: "Bhadrika", lord: 3 as PlanetId, years: 5 },
  { name: "Ulka", lord: 6 as PlanetId, years: 6 },
  { name: "Siddha", lord: 5 as PlanetId, years: 7 },
  { name: "Sankata", lord: 7 as PlanetId, years: 8 },
];

export function yoginiDasha(jdBirth: number, moonLon: number, daysPerYear = YEAR_365) {
  const lon = ((moonLon % 360) + 360) % 360;
  const nakIndex = Math.floor(lon / NAKSHATRA_SPAN) % 27;
  const idx = (nakIndex + 3) % 8;
  const fraction = (lon % NAKSHATRA_SPAN) / NAKSHATRA_SPAN;
  const start = jdBirth - fraction * YOGINIS[idx].years * daysPerYear;

  const out: { name: string; lord: PlanetId; startJd: number; endJd: number }[] = [];
  let jd = start;
  for (let i = 0; i < 24; i++) {
    const y = YOGINIS[(idx + i) % 8];
    out.push({ name: y.name, lord: y.lord, startJd: jd, endJd: jd + y.years * daysPerYear });
    jd += y.years * daysPerYear;
  }
  return out;
}
